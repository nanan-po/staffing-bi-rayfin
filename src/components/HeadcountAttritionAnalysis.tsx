// Dữ liệu DEMO - Phân tích nghỉ việc theo Miền
const resignationData = [
  { region: "Miền Nam", reason: "Chưa cập nhật", count: 682 },
  { region: "Miền Bắc", reason: "Chưa cập nhật", count: 509 },
  { region: "Miền Trung", reason: "Chưa cập nhật", count: 299 },
];

const total = resignationData.reduce(
  (sum, item) => sum + item.count,
  0
);

const formatNumber = (value: number) =>
  value.toLocaleString("en-US");

const formatPercent = (value: number) =>
  total === 0 ? "0.00%" : ((value / total) * 100).toFixed(2) + "%";

const cellStyle = {
  padding: "12px 10px",
  borderBottom: "1px solid #dbe5f1",
  fontSize: 12,
};

export default function HeadcountAttritionAnalysis() {
  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
          color: "#64748b",
          fontSize: 12,
        }}
      >
        <span>Phân tích theo Miền</span>
        <strong>2026 (YTD đến T10)</strong>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "#153b73",
            fontSize: 12,
            minWidth: 460,
          }}
        >
          <thead>
            <tr style={{ background: "#e8f1fb" }}>
              {["Miền", "Lý do nghỉ", "Số lượng", "% Nghỉ việc"].map(
                (column, index) => (
                  <th
                    key={column}
                    style={{
                      ...cellStyle,
                      textAlign: index < 2 ? "left" : "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {column}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            <tr
              style={{
                background: "#d7eaff",
                fontWeight: 700,
              }}
            >
              <td style={cellStyle}>Total</td>
              <td style={cellStyle}></td>
              <td style={{ ...cellStyle, textAlign: "right" }}>
                {formatNumber(total)}
              </td>
              <td style={{ ...cellStyle, textAlign: "right" }}>
                100.00%
              </td>
            </tr>

            {resignationData.map((item, index) => (
              <tr
                key={item.region}
                style={{
                  background:
                    index % 2 === 0 ? "#ffffff" : "#f5f9fe",
                }}
              >
                <td style={cellStyle}>{item.region}</td>
                <td style={cellStyle}>{item.reason}</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>
                  {formatNumber(item.count)}
                </td>
                <td style={{ ...cellStyle, textAlign: "right" }}>
                  {formatPercent(item.count)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}