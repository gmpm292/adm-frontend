import { Chart } from 'primereact/chart';

export function Sales() {
    const chartData = {
        labels: ['Producto A', 'Producto B', 'Producto C', 'Producto D'],
        datasets: [
            {
                data: [540, 325, 702, 421],
                backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA']
            }
        ]
    };

    const options = {
        plugins: {
            title: {
                display: true,
                text: 'Ventas por Producto',
                font: { size: 16 }
            }
        }
    };

    return (
        <div className="card">
            <h1>Reporte de Ventas</h1>
            <div className="grid">
                <div className="col-12 md:col-6">
                    <Chart type="pie" data={chartData} options={options} />
                </div>
                <div className="col-12 md:col-6">
                    <div className="surface-card p-4 shadow-2 border-round">
                        <h2>Resumen de Ventas</h2>
                        <ul className="list-none p-0 m-0">
                            <li className="flex align-items-center mb-3">
                                <span className="text-900 font-medium mr-2">Ventas Totales:</span>
                                <span className="text-700">$198,450</span>
                            </li>
                            <li className="flex align-items-center mb-3">
                                <span className="text-900 font-medium mr-2">Mejor Producto:</span>
                                <span className="text-700">Producto C</span>
                            </li>
                            <li className="flex align-items-center">
                                <span className="text-900 font-medium mr-2">Crecimiento Mensual:</span>
                                <span className="text-green-500">+18.2%</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
} 