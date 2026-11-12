// Dữ liệu DEMO theo Miền từ layout HTML gốc.
// Chưa kết nối CSV hoặc Power BI.

const regions = [
  { name: "Miền Nam", plan: 1420, actual: 1400 },
  { name: "Miền Bắc", plan: 1067, actual: 1050 },
  { name: "Miền Trung", plan: 623, actual: 613 },
];

const totalPlan = regions.reduce(
  (sum, region) => sum + region.plan,
  0
);

const totalActual = regions.reduce(
  (sum, region) => sum + region.actual,
  0
);

const formatNumber = (value: number) =>
  value.toLocaleString("en-US");

const formatPercent = (actual: number, plan: number) =>
  plan === 0 ? "—" : `${((actual / plan) * 100).toFixed(1)}%`;

export default function HeadcountHotspots() {
  return (
    <div style={{ overflowX: "auto", marginTop: 16 }}>
      <table
        style={{
          width: "100%",
          minWidth: 450,
          borderCollapse: "collapse",
          fontSize: 12,
          color: "#153b73",
        }}
      >
        <thead>
          <tr style={{ background: "#e8f1fb" }}>
            {[
              "Miền",
              "HC kế hoạch",
              "HC hiện tại",
              "% thực đạt",
              "Vacant",
            ].map((column) => (
              <th
                key={column}
                style={{
                  padding: "12px 8px",
                  textAlign:
                    column === "Miền" ? "left" : "right",
                  borderBottom: "1px solid #dbe5f1",
                  whiteSpace: "nowrap",
                }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {regions.map((region, index) => (
            <tr
              key={region.name}
              style={{
                background:
                  index % 2 === 0 ? "#ffffff" : "#f5f9fe",
              }}
            >
              <td style={cellStyle}>{region.name}</td>

              <td style={{ ...cellStyle, textAlign: "right" }}>
                {formatNumber(region.plan)}
              </td>

              <td style={{ ...cellStyle, textAlign: "right" }}>
                {formatNumber(region.actual)}
              </td>

              <td style={{ ...cellStyle, textAlign: "right" }}>
                {formatPercent(region.actual, region.plan)}
              </td>

              <td style={{ ...cellStyle, textAlign: "right" }}>
                {formatNumber(region.plan - region.actual)}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr
            style={{
              background: "#d7eaff",
              fontWeight: 700,
            }}
          >
            <td style={cellStyle}>Tổng</td>

            <td style={{ ...cellStyle, textAlign: "right" }}>
              {formatNumber(totalPlan)}
            </td>

            <td style={{ ...cellStyle, textAlign: "right" }}>
              {formatNumber(totalActual)}
            </td>

            <td style={{ ...cellStyle, textAlign: "right" }}>
              {formatPercent(totalActual, totalPlan)}
            </td>

            <td style={{ ...cellStyle, textAlign: "right" }}>
              {formatNumber(totalPlan - totalActual)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const cellStyle = {
  padding: "12px 8px",
  borderBottom: "1px solid #e2e8f0",
};