import { useMemo, useState } from "react";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { SelectButton } from "primereact/selectbutton";
import { Tag } from "primereact/tag";
import { NoData } from "../../../../components/ui";
import { formatMoney, formatNumber } from "../../../statistics/format";

// Por debajo de estas unidades se avisa de que queda poco
const LOW_STOCK = 5;
const ALL_CATEGORIES = 0;

const normalize = (text) =>
  (text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Precio a mostrar: en la moneda elegida o, si no se vende en ella, en la suya */
const priceOf = (product, currency) =>
  product.prices.find((price) => price.currency === currency) ??
  product.prices.find((price) => price.currency === product.baseCurrency) ??
  product.prices[0];

/**
 * Catálogo de la tienda: se busca, se filtra por categoría y cada toque sobre
 * un producto suma una unidad a la venta.
 */
export function ProductCatalog({
  products,
  categories,
  currencies,
  currency,
  onCurrencyChange,
  quantities,
  onAdd,
}) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(ALL_CATEGORIES);

  const visible = useMemo(() => {
    const term = normalize(search.trim());
    return products.filter(
      (product) =>
        (categoryId === ALL_CATEGORIES || product.categoryId === categoryId) &&
        (!term || normalize(product.name).includes(term)),
    );
  }, [products, search, categoryId]);

  const leftOf = (product) => product.stock - (quantities.get(product.id) ?? 0);

  // Con un solo resultado, Enter lo añade: sirve para vender tecleando
  const handleSearchKeyDown = (event) => {
    if (event.key !== "Enter" || visible.length !== 1) return;
    if (leftOf(visible[0]) > 0) {
      onAdd(visible[0]);
      setSearch("");
    }
  };

  return (
    <section>
      <div className="pos-catalog__filters">
        <IconField iconPosition="left" className="pos-catalog__search">
          <InputIcon className="pi pi-search" />
          <InputText
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar producto"
            aria-label="Buscar producto"
            autoFocus
          />
        </IconField>
        {currencies.length > 1 && (
          <SelectButton
            value={currency}
            options={currencies.map((c) => ({ label: c.code, value: c.code }))}
            onChange={(e) => onCurrencyChange(e.value)}
            allowEmpty={false}
            aria-label="Moneda de los precios"
          />
        )}
      </div>

      {categories.length > 1 && (
        <div className="pos-catalog__categories">
          {[{ id: ALL_CATEGORIES, name: "Todas" }, ...categories].map(
            (category) => (
              <button
                key={category.id}
                type="button"
                className={
                  category.id === categoryId
                    ? "pos-chip pos-chip--active"
                    : "pos-chip"
                }
                aria-pressed={category.id === categoryId}
                onClick={() => setCategoryId(category.id)}
              >
                {category.name}
              </button>
            ),
          )}
        </div>
      )}

      {visible.length === 0 ? (
        <NoData
          message={
            products.length === 0
              ? "Esta tienda no tiene productos con precio para vender"
              : "Ningún producto coincide con la búsqueda"
          }
        />
      ) : (
        <div className="pos-products">
          {visible.map((product) => {
            const inCart = quantities.get(product.id) ?? 0;
            const left = leftOf(product);
            const price = priceOf(product, currency);

            return (
              <button
                key={product.id}
                type="button"
                className={
                  inCart > 0
                    ? "pos-product pos-product--in-cart"
                    : "pos-product"
                }
                disabled={left <= 0}
                onClick={() => onAdd(product)}
              >
                <span className="pos-product__name">{product.name}</span>
                <span className="pos-product__category">
                  {product.categoryName ?? "Sin categoría"}
                </span>
                <span className="pos-product__price">
                  {formatMoney(price.unitPrice, price.currency)}
                </span>
                <span className="pos-product__foot">
                  {left <= 0 ? (
                    <Tag severity="danger" value="Agotado" />
                  ) : left <= LOW_STOCK ? (
                    <Tag
                      severity="warning"
                      value={left === 1 ? "Queda 1" : `Quedan ${left}`}
                    />
                  ) : (
                    <span>{formatNumber(left)} disponibles</span>
                  )}
                  {inCart > 0 && (
                    <span
                      className="pos-product__count"
                      aria-label={`${inCart} en la venta`}
                    >
                      {inCart}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
