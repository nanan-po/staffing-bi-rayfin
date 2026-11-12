// Dữ liệu DEMO, chưa kết nối Power BI
const attritionData = [
  { month: "01/26", rate: 4.5 },
  { month: "02/26", rate: 4.9 },
  { month: "03/26", rate: 7.7 },
  { month: "04/26", rate: 6.9 },
  { month: "05/26", rate: 7.0 },
  { month: "06/26", rate: 5.8 },
  { month: "07/26", rate: 5.2 },
  { month: "08/26", rate: 4.5 },
  { month: "09/26", rate: 4.8 },
  { month: "10/26", rate: 3.2 },
];

const getX = (i: number) => 55 + (i * 690) / 9;
const getY = (rate: number) => 215 - (rate / 10) * 165;

export default function HeadcountAttritionTrend() {
  const points = attritionData
    .map((item, i) => `${getX(i)},${getY(item.rate)}`)
    .join(" ");

  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox="0 0 800 270"
        style={{ width: "100%", height: "auto" }}
        role="img"
        aria-label="Xu hướng tỷ lệ nghỉ việc theo tháng"
      >
        {/* Chỉ vẽ đường lưới, không hiển thị số trục Y */}
{[0, 5, 10].map((value) => (
  <line
    key={value}
    x1={55}
    x2={745}
    y1={getY(value)}
    y2={getY(value)}
    stroke="#e2e8f0"
  />
))}

        <polyline
          points={points}
          fill="none"
          stroke="#ef6b5b"
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {attritionData.map((item, i) => (
          <g key={item.month}>
            <circle
              cx={getX(i)}
              cy={getY(item.rate)}
              r={4}
              fill="#ef6b5b"
            >
              <title>
                {`${item.month}: ${item.rate.toFixed(1)}%`}
              </title>
            </circle>

            <text
              x={getX(i)}
              y={getY(item.rate) - 13}
              textAnchor="middle"
              fontSize={12}
              fill="#ef6b5b"
            >
              {item.rate.toFixed(1)}%
            </text>

            <text
              x={getX(i)}
              y={243}
              textAnchor="middle"
              fontSize={11}
              fill="#64748b"
            >
              {item.month}
            </text>
          </g>
        ))}
      </svg>

      <p
        style={{
          margin: "6px 0 0",
          textAlign: "center",
          color: "#64748b",
          fontSize: 12,
        }}
      >
        10/2026 · Tỷ lệ nghỉ việc: 3.2%
      </p>
    </div>
  );
}