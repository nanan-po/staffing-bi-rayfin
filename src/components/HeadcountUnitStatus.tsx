// Dữ liệu DEMO - Tình hình nhân sự theo đơn vị
const unitData = [
  {
    region: "Miền Nam",
    previous: 1388,
    hired: 57,
    resigned: 45,
  },
  {
    region: "Miền Bắc",
    previous: 1038,
    hired: 43,
    resigned: 31,
  },
  {
    region: "Miền Trung",
    previous: 610,
    hired: 25,
    resigned: 22,
  },
];

const formatNumber = (n: number) =>
  n.toLocaleString("en-US");

const formatRate = (n: number, base: number) =>
  base === 0 ? "—" : ((n / base) * 100).toFixed(1) + "%";

const totals = unitData.reduce(
  (sum, row) => ({
    previous: sum.previous + row.previous,
    hired: sum.hired + row.hired,
    resigned: sum.resigned + row.resigned,
  }),
  { previous: 0, hired: 0, resigned: 0 }
);

const cellStyle = {
  padding: "11px 8px",
  borderBottom: "1px solid #dbe5f1",
  whiteSpace: "nowrap" as const,
};

export default function HeadcountUnitStatus() {
  return (
    <div style={{ marginTop: 16, overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          minWidth: 850,
          borderCollapse: "collapse",
          color: "#153b73",
          fontSize: 12,
        }}
      >
        <thead>
          <tr style={{ background: "#e8f1fb" }}>
            {[
              "Miền",
              "HC tháng trước",
              "HC mới",
              "Tỷ lệ tuyển mới",
              "HC nghỉ",
              "Tỷ lệ nghỉ việc",
              "Biến động Mới - Nghỉ",
              "HC hiện tại",
            ].map((label, index) => (
              <th
                key={label}
                style={{
                  ...cellStyle,
                  textAlign: index === 0 ? "left" : "right",
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {unitData.map((row, index) => {
            const change = row.hired - row.resigned;
            const current = row.previous + change;

            return (
              <tr
                key={row.region}
                style={{
                  background:
                    index % 2 === 0 ? "#ffffff" : "#f5f9fe",
                }}
              >
                <td style={cellStyle}>{row.region}</td>

                <td style={{ ...cellStyle, textAlign: "right" }}>
                  {formatNumber(row.previous)}
                </td>

                <td style={{
                  ...cellStyle,
                  textAlign: "right",
                  color: "#16a34a",
                }}>
                  {formatNumber(row.hired)}
                </td>

                <td style={{ ...cellStyle, textAlign: "right" }}>
                  {formatRate(row.hired, row.previous)}
                </td>

                <td style={{
                  ...cellStyle,
                  textAlign: "right",
                  color: "#ef6b5b",
                }}>
                  {formatNumber(row.resigned)}
                </td>

                <td style={{ ...cellStyle, textAlign: "right" }}>
                  {formatRate(row.resigned, row.previous)}
                </td>

                <td style={{ ...cellStyle, textAlign: "right" }}>
                  {change > 0 ? "+" : ""}
                  {formatNumber(change)}
                </td>

                <td style={{
                  ...cellStyle,
                  textAlign: "right",
                  fontWeight: 700,
                }}>
                  {formatNumber(current)}
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr style={{
            background: "#d7eaff",
            fontWeight: 700,
          }}>
            <td style={cellStyle}>Tổng</td>

            <td style={{ ...cellStyle, textAlign: "right" }}>
              {formatNumber(totals.previous)}
            </td>

            <td style={{ ...cellStyle, textAlign: "right" }}>
              {formatNumber(totals.hired)}
            </td>

            <td style={{ ...cellStyle, textAlign: "right" }}>
              {formatRate(totals.hired, totals.previous)}
            </td>

            <td style={{ ...cellStyle, textAlign: "right" }}>
              {formatNumber(totals.resigned)}
            </td>

            <td style={{ ...cellStyle, textAlign: "right" }}>
              {formatRate(totals.resigned, totals.previous)}
            </td>

            <td style={{ ...cellStyle, textAlign: "right" }}>
              +{formatNumber(totals.hired - totals.resigned)}
            </td>

            <td style={{ ...cellStyle, textAlign: "right" }}>
              {formatNumber(
                totals.previous + totals.hired - totals.resigned
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}