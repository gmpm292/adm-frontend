import { CompanyUnitTable } from "../../shared/CompanyUnitTable";
import { UNITS } from "../../shared/units";

export function DepartmentTable() {
  return <CompanyUnitTable unit={UNITS.department} />;
}

export default DepartmentTable;
