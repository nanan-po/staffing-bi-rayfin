
import type {
  DongPhanTichNghiViec,
} from "../services/PhanTichNghiViecTheoNhom.service";

type Props = {
  groups: string[];
  data: DongPhanTichNghiViec[];
  year: number;
  month: number | null;
  loading?: boolean;
  error?: string | null;
};

const formatNumber = (value: number) =>
  value.toLocaleString("en-US");

const formatPercent = (
  value: number,
  total: number
) =>
  total === 0
    ? "—"
    : `${((value / total) * 100).toFixed(2)}%`;

const cellStyle = {
  padding: "10px 9px",
  borderBottom: "1px solid #dbe5f1",
  fontSize: 11,
  whiteSpace: "nowrap" as const,
};

export default function PhanTichNghiViecTheoNhom({
  groups = ["Miền"],
  data = [],
  year,
  month,
  loading = false,
  error = null,
}: Props) {
  // Dam bao groups va data luon la mang hop le
  const activeGroups =
    Array.isArray(groups) && groups.length > 0
      ? groups
      : ["Miền"];

  const safeData = Array.isArray(data) ? data : [];

  // Tong so luong theo ket qua Power BI
  const total = safeData.reduce(
    (sum, item) => sum + (item.count || 0),
    0
  );

  // Tang chieu rong khi chon nhieu Dimension
  // Cong them khong gian cho 2 cot ly do nghi
  const minTableWidth =
    activeGroups.length * 150 + 520;

  // Tong so cot = so Dimension + 4 cot chi tieu
  const totalColumns = activeGroups.length + 4;

  return (
    <div
      style={{
        marginTop: 12,
        minWidth: 0,
      }}
    >
      {/* THONG TIN KY BAO CAO */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 10,
          color: "#64748b",
          fontSize: 12,
        }}
      >
        <span>
          Phân tích theo {activeGroups.join(" + ")}
        </span>

        <strong>
          {month === null
            ? `${year} (các trường hợp nghỉ trong năm)`
            : `${year} - T${String(month).padStart(2, "0")}`}
        </strong>
      </div>

      {/* TRANG THAI TAI DU LIEU */}
      {loading && (
        <div
          style={{
            color: "#64748b",
            paddingBottom: 8,
            fontSize: 12,
          }}
        >
          Đang tải dữ liệu nghỉ việc từ Power BI...
        </div>
      )}

      {/* THONG BAO LOI */}
      {error && (
        <div
          style={{
            color: "#b91c1c",
            paddingBottom: 8,
            fontSize: 12,
          }}
        >
          Lỗi Power BI: {error}
        </div>
      )}

      {/* KHUNG BANG CUON DOC VA NGANG */}
      <div
        style={{
          height: 300,
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
            color: "#153b73",
            fontSize: 11,
          }}
        >
          {/* HEADER */}
          <thead>
            <tr>
              {[
                ...activeGroups,
                "Nhóm lý do nghỉ",
                "Lý do nghỉ chi tiết",
                "Số lượng",
                "% Nghỉ việc",
              ].map((column, index) => (
                <th
                  key={column}
                  style={{
                    ...cellStyle,
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    background: "#e8f1fb",
                    textAlign:
                      index < activeGroups.length + 2
                        ? "left"
                        : "right",
                    whiteSpace: "nowrap",
                    fontWeight: 700,
                  }}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* DONG TONG */}
            {!loading && !error && (
              <tr
                style={{
                  background: "#d7eaff",
                  fontWeight: 700,
                }}
              >
                <td
                  colSpan={activeGroups.length + 2}
                  style={cellStyle}
                >
                  Tổng
                </td>

                <td
                  style={{
                    ...cellStyle,
                    textAlign: "right",
                  }}
                >
                  {formatNumber(total)}
                </td>

                <td
                  style={{
                    ...cellStyle,
                    textAlign: "right",
                  }}
                >
                  {total === 0 ? "—" : "100.00%"}
                </td>
              </tr>
            )}

            {/* KHONG CO DU LIEU */}
            {!loading &&
              !error &&
              safeData.length === 0 && (
                <tr>
                  <td
                    colSpan={totalColumns}
                    style={{
                      ...cellStyle,
                      textAlign: "center",
                      color: "#64748b",
                      padding: 20,
                    }}
                  >
                    Không có dữ liệu nghỉ việc trong kỳ.
                  </td>
                </tr>
              )}

            {/* DU LIEU THUC TU POWER BI */}
            {!loading &&
              !error &&
              safeData.map((item, index) => (
                <tr
                  key={`${
                    Array.isArray(item.values)
                      ? item.values.join("|")
                      : "unknown"
                  }|${item.reason}|${item.reasonDetail}|${index}`}
                  style={{
                    background:
                      index % 2 === 0
                        ? "#ffffff"
                        : "#f5f9fe",
                  }}
                >
                  {/* CAC COT DIMENSION DONG */}
                  {activeGroups.map(
                    (group, groupIndex) => (
                      <td
                        key={group}
                        style={cellStyle}
                      >
                        {Array.isArray(item.values)
                          ? item.values[groupIndex] ??
                            "Chưa xác định"
                          : "Chưa xác định"}
                      </td>
                    )
                  )}

                  {/* NHOM LY DO NGHI */}
                  <td style={cellStyle}>
                    {item.reason || "Chưa cập nhật"}
                  </td>

                  {/* LY DO NGHI CHI TIET */}
                  <td
                    style={{
                      ...cellStyle,
                      minWidth: 180,
                      maxWidth: 280,
                      whiteSpace: "normal",
                      overflowWrap: "break-word",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.reasonDetail || "Chưa cập nhật"}
                  </td>

                  {/* SO LUONG */}
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "right",
                    }}
                  >
                    {formatNumber(item.count)}
                  </td>

                  {/* % NGHI VIEC */}
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "right",
                    }}
                  >
                    {formatPercent(
                      item.count,
                      total
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* GHI CHU CHI SO */}
      <div
        style={{
          color: "#64748b",
          fontSize: 10,
          marginTop: 6,
          lineHeight: 1.5,
        }}
      >
        % Nghỉ việc là tỷ trọng số lượng trong tổng
        các nhóm lý do nghỉ của bảng, không phải tỷ lệ
        nghỉ trên HC hiện tại.
      </div>
    </div>
  );
}
