import type {
  DongDiemNong,
  NhomDiemNong,
} from "../services/DiemNongNguonLuc.service";

type Props = {
  groups: NhomDiemNong[];
  data: DongDiemNong[];
  loading?: boolean;
  error?: string | null;
};

const formatNumber = (value: number | null) =>
  value === null ? "—" : value.toLocaleString("en-US");

const formatPercent = (actual: number | null, plan: number | null) =>
  actual === null || plan === null || plan === 0
    ? "—"
    : `${((actual / plan) * 100).toFixed(1)}%`;

const cellStyle = {
  padding: "10px 8px",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap" as const,
};

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

// Chấp nhận cả dữ liệu từ service mới (values) và định dạng cũ (name)
// để hot reload không làm toàn bộ trang bị trắng khi có dữ liệu cũ.
type DongChuaChuanHoa = Partial<DongDiemNong> & { name?: unknown };

export default function DiemNongNguonLuc({
  groups = ["Miền"],
  data = [],
  loading = false,
  error = null,
}: Props) {
  const safeGroups: NhomDiemNong[] =
    Array.isArray(groups) && groups.length > 0 ? groups : ["Miền"];
  const inputData: DongChuaChuanHoa[] = Array.isArray(data) ? data : [];
  const invalidRows = inputData.filter((row) => !Array.isArray(row?.values)).length;

  const rows = inputData.map((row) => {
    const rawValues = Array.isArray(row?.values)
      ? row.values
      : [typeof row?.name === "string" ? row.name : "Chưa xác định"];

    return {
      values: safeGroups.map((_, index) => {
        const value = rawValues[index];
        return value === null || value === undefined || String(value).trim() === ""
          ? "Chưa xác định"
          : String(value);
      }),
      plan: toNumber(row?.plan),
      actual: toNumber(row?.actual),
      vacant: toNumber(row?.vacant),
    };
  });

  const totalPlan = rows.reduce((sum, row) => sum + (row.plan ?? 0), 0);
  const totalActual = rows.reduce((sum, row) => sum + (row.actual ?? 0), 0);
  const totalVacant = rows.reduce((sum, row) => sum + (row.vacant ?? 0), 0);

  const minTableWidth = Math.max(520, safeGroups.length * 150 + 380);
  const totalCellStyle = {
    ...cellStyle,
    position: "sticky" as const,
    bottom: 0,
    background: "#d7eaff",
    fontWeight: 700,
    borderTop: "1px solid #adc9eb",
    zIndex: 2,
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        marginTop: 10,
        overflow: "hidden",
      }}
    >
      {loading && (
        <div style={{ padding: 8, fontSize: 11, color: "#64748b" }}>
          Đang tải dữ liệu Power BI...
        </div>
      )}
      {error && (
        <div role="alert" style={{ padding: 8, fontSize: 11, color: "#b91c1c" }}>
          Lỗi tải dữ liệu: {error}
        </div>
      )}
      {!loading && !error && invalidRows > 0 && (
        <div role="status" style={{ padding: 8, fontSize: 11, color: "#92400e" }}>
          Có {invalidRows} dòng chưa có values từ Service. Hãy kiểm tra
          DiemNongNguonLuc.service.ts nếu dữ liệu phân nhóm không đúng.
        </div>
      )}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          width: "100%",
          overflow: "auto",
          overscrollBehavior: "contain",
          border: "1px solid #e2e8f0",
          borderRadius: 4,
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: minTableWidth,
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: 11,
            color: "#153b73",
          }}
        >
          <thead>
            <tr>
              {safeGroups.map((group) => (
                <th
                  key={group}
                  style={{
                    ...cellStyle,
                    position: "sticky",
                    top: 0,
                    zIndex: 3,
                    background: "#e8f1fb",
                    textAlign: "left",
                  }}
                >
                  {group}
                </th>
              ))}
              {["HC kế hoạch", "HC hiện tại", "% thực đạt", "Vacant"].map(
                (column) => (
                  <th
                    key={column}
                    style={{
                      ...cellStyle,
                      position: "sticky",
                      top: 0,
                      zIndex: 3,
                      background: "#e8f1fb",
                      textAlign: "right",
                    }}
                  >
                    {column}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td
                  colSpan={safeGroups.length + 4}
                  style={{ padding: 20, textAlign: "center", color: "#64748b" }}
                >
                  Không có dữ liệu theo bộ lọc.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              rows.map((row, index) => (
                <tr
                  key={`${row.values.join("|")}-${index}`}
                  style={{
                    background: index % 2 === 0 ? "#ffffff" : "#f5f9fe",
                  }}
                >
                  {safeGroups.map((group, groupIndex) => (
                    <td key={group} style={{ ...cellStyle, textAlign: "left" }}>
                      {row.values[groupIndex]}
                    </td>
                  ))}
                  <td style={{ ...cellStyle, textAlign: "right" }}>
                    {formatNumber(row.plan)}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "right" }}>
                    {formatNumber(row.actual)}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "right" }}>
                    {formatPercent(row.actual, row.plan)}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "right" }}>
                    {formatNumber(row.vacant)}
                  </td>
                </tr>
              ))}
          </tbody>
          {!loading && !error && rows.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={safeGroups.length} style={{ ...totalCellStyle, textAlign: "left" }}>
                  Tổng
                </td>
                <td style={{ ...totalCellStyle, textAlign: "right" }}>
                  {formatNumber(totalPlan)}
                </td>
                <td style={{ ...totalCellStyle, textAlign: "right" }}>
                  {formatNumber(totalActual)}
                </td>
                <td style={{ ...totalCellStyle, textAlign: "right" }}>
                  {formatPercent(totalActual, totalPlan)}
                </td>
                <td style={{ ...totalCellStyle, textAlign: "right" }}>
                  {formatNumber(totalVacant)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
