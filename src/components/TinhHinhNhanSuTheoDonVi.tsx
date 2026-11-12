
import type {
  DongTinhHinhDonVi,
} from "../services/TinhHinhNhanSuTheoDonVi.service";

type Props = {
  groups: string[];
  data: DongTinhHinhDonVi[];
  year: number;
  month: number | null;
  loading?: boolean;
  error?: string | null;
};

type NumericKey =
  | "previous"
  | "hired"
  | "resigned"
  | "current";

const formatNumber = (
  value: number | null
): string =>
  value === null
    ? "—"
    : value.toLocaleString("en-US");

const formatRate = (
  value: number | null,
  base: number | null
): string => {
  if (
    value === null ||
    base === null ||
    base === 0
  ) {
    return "—";
  }

  return `${((value / base) * 100).toFixed(1)}%`;
};

const netChange = (
  hired: number | null,
  resigned: number | null
): number | null => {
  if (hired === null && resigned === null) {
    return null;
  }

  return (hired ?? 0) - (resigned ?? 0);
};

const formatChange = (
  value: number | null
): string => {
  if (value === null) return "—";

  return `${value > 0 ? "+" : ""}${formatNumber(value)}`;
};

const cellStyle = {
  padding: "10px 8px",
  borderBottom: "1px solid #dbe5f1",
  whiteSpace: "nowrap" as const,
  fontSize: 11,
};

export default function TinhHinhNhanSuTheoDonVi({
  groups = ["Miền"],
  data = [],
  year,
  month,
  loading = false,
  error = null,
}: Props) {
  const activeGroups =
    Array.isArray(groups) && groups.length > 0
      ? groups
      : ["Miền"];

  const safeData = Array.isArray(data)
    ? data
    : [];

  // Tong tung Measure theo cac dong duoc tra ve
  const sum = (key: NumericKey): number | null => {
    if (safeData.length === 0) return null;

    const hasValue = safeData.some(
      (row) => row[key] !== null
    );

    if (!hasValue) return null;

    return safeData.reduce(
      (total, row) => total + (row[key] ?? 0),
      0
    );
  };

  const totalPrevious = sum("previous");
  const totalHired = sum("hired");
  const totalResigned = sum("resigned");
  const totalCurrent = sum("current");

  const totalChange = netChange(
    totalHired,
    totalResigned
  );

  // 7 cot chi so + cac Dimension duoc chon
  const minTableWidth =
    activeGroups.length * 150 + 900;

  const columns = [
    ...activeGroups,
    "HC tháng trước",
    "HC mới",
    "Tỷ lệ tuyển mới",
    "HC nghỉ",
    "Tỷ lệ nghỉ việc",
    "Biến động Mới - Nghỉ",
    "HC hiện tại",
  ];

  const totalCellStyle = {
    ...cellStyle,
    background: "#d7eaff",
    fontWeight: 700,
    position: "sticky" as const,
    bottom: 0,
    zIndex: 2,
    borderTop: "1px solid #adc9eb",
  };

  return (
    <div
      style={{
        marginTop: 12,
        minWidth: 0,
      }}
    >
      {/* THONG TIN PHAN NHOM VA KY BAO CAO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 10,
          fontSize: 12,
          color: "#64748b",
        }}
      >
        <span>
          Phân tích theo {activeGroups.join(" + ")}
        </span>

        <strong>
          {month === null
            ? `${year} (Tất cả / YTD)`
            : `${year} - T${String(month).padStart(2, "0")}`}
        </strong>
      </div>

      {loading && (
        <div
          style={{
            color: "#64748b",
            fontSize: 12,
            paddingBottom: 8,
          }}
        >
          Đang tải tình hình nhân sự từ Power BI...
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            color: "#b91c1c",
            fontSize: 12,
            paddingBottom: 8,
          }}
        >
          Lỗi Power BI: {error}
        </div>
      )}

      {/* KHUNG CUON NOI BO */}
      <div
        style={{
          height: 320,
          maxWidth: "100%",
          overflow: "auto",
          overscrollBehavior: "contain",
          border: "1px solid #dbe5f1",
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
              {columns.map((label, index) => (
                <th
                  key={label}
                  style={{
                    ...cellStyle,
                    position: "sticky",
                    top: 0,
                    zIndex: 3,
                    background: "#e8f1fb",
                    fontWeight: 700,
                    textAlign:
                      index < activeGroups.length
                        ? "left"
                        : "right",
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!loading &&
              !error &&
              safeData.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      padding: 20,
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    Không có dữ liệu nhân sự theo
                    bộ lọc đang chọn.
                  </td>
                </tr>
              )}

            {!loading &&
              !error &&
              safeData.map((row, index) => {
                const change = netChange(
                  row.hired,
                  row.resigned
                );

                return (
                  <tr
                    key={`${
                      Array.isArray(row.values)
                        ? row.values.join("|")
                        : "unknown"
                    }-${index}`}
                    style={{
                      background:
                        index % 2 === 0
                          ? "#ffffff"
                          : "#f5f9fe",
                    }}
                  >
                    {/* CAC COT DIMENSION */}
                    {activeGroups.map(
                      (group, groupIndex) => (
                        <td
                          key={group}
                          style={cellStyle}
                        >
                          {Array.isArray(row.values)
                            ? row.values[groupIndex] ??
                              "Chưa xác định"
                            : "Chưa xác định"}
                        </td>
                      )
                    )}

                    {/* HC THANG TRUOC */}
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "right",
                      }}
                    >
                      {formatNumber(row.previous)}
                    </td>

                    {/* HC MOI */}
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "right",
                        color: "#16a34a",
                      }}
                    >
                      {formatNumber(row.hired)}
                    </td>

                    {/* TY LE TUYEN MOI */}
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "right",
                      }}
                    >
                      {formatRate(
                        row.hired,
                        row.previous
                      )}
                    </td>

                    {/* HC NGHI */}
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "right",
                        color: "#ef6b5b",
                      }}
                    >
                      {formatNumber(row.resigned)}
                    </td>

                    {/* TY LE NGHI VIEC */}
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "right",
                      }}
                    >
                      {formatRate(
                        row.resigned,
                        row.previous
                      )}
                    </td>

                    {/* BIEN DONG MOI - NGHI */}
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "right",
                        color:
                          change === null
                            ? "#64748b"
                            : change >= 0
                            ? "#16a34a"
                            : "#ef6b5b",
                      }}
                    >
                      {formatChange(change)}
                    </td>

                    {/* HC HIEN TAI */}
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "right",
                        fontWeight: 700,
                      }}
                    >
                      {formatNumber(row.current)}
                    </td>
                  </tr>
                );
              })}
          </tbody>

          {!loading &&
            !error &&
            safeData.length > 0 && (
              <tfoot>
                <tr>
                  <td
                    colSpan={activeGroups.length}
                    style={totalCellStyle}
                  >
                    Tổng
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      textAlign: "right",
                    }}
                  >
                    {formatNumber(totalPrevious)}
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      textAlign: "right",
                      color: "#16a34a",
                    }}
                  >
                    {formatNumber(totalHired)}
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      textAlign: "right",
                    }}
                  >
                    {formatRate(
                      totalHired,
                      totalPrevious
                    )}
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      textAlign: "right",
                      color: "#ef6b5b",
                    }}
                  >
                    {formatNumber(totalResigned)}
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      textAlign: "right",
                    }}
                  >
                    {formatRate(
                      totalResigned,
                      totalPrevious
                    )}
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      textAlign: "right",
                      color:
                        totalChange !== null &&
                        totalChange < 0
                          ? "#ef6b5b"
                          : "#16a34a",
                    }}
                  >
                    {formatChange(totalChange)}
                  </td>

                  <td
                    style={{
                      ...totalCellStyle,
                      textAlign: "right",
                    }}
                  >
                    {formatNumber(totalCurrent)}
                  </td>
                </tr>
              </tfoot>
            )}
        </table>
      </div>

      <div
        style={{
          color: "#64748b",
          fontSize: 10,
          marginTop: 6,
          lineHeight: 1.5,
        }}
      >
        HC hiện tại lấy trực tiếp từ Power BI;
        biến động Mới - Nghỉ là chỉ số riêng.
        Tỷ lệ được tính trên HC tháng trước.
      </div>
    </div>
  );
}
