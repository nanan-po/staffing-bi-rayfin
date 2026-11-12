// Dữ liệu DEMO - Cơ cấu nhân sự hiện tại theo Miền
const headcountData = [
  { region: "Miền Nam", count: 1400 },
  { region: "Miền Bắc", count: 1050 },
  { region: "Miền Trung", count: 613 },
];

const maxHC = Math.max(...headcountData.map((item) => item.count));

const totalHC = headcountData.reduce(
  (sum, item) => sum + item.count,
  0
);

export default function HeadcountCurrentStructure() {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "grid", gap: 22 }}>
        {headcountData.map((item) => (
          <div
            key={item.region}
            style={{
              display: "grid",
              gridTemplateColumns: "75px minmax(0, 1fr) 42px",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#153b73",
              }}
            >
              {item.region}
            </span>

            <div
              style={{
                height: 18,
                background: "#e7f0fe",
                borderRadius: 3,
                overflow: "hidden",
              }}
              role="img"
              aria-label={`${item.region}: ${item.count} nhân sự`}
            >
              <div
                style={{
                  width: `${(item.count / maxHC) * 100}%`,
                  height: "100%",
                  background: "#1685ed",
                }}
              />
            </div>

            <strong
              style={{
                fontSize: 12,
                color: "#153b73",
                textAlign: "right",
              }}
            >
              {item.count.toLocaleString("en-US")}
            </strong>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid #dbe5f1",
          marginTop: 24,
          paddingTop: 14,
          color: "#153b73",
          fontSize: 12,
        }}
      >
        <span>Tổng nhân sự hiện tại</span>
        <strong>{totalHC.toLocaleString("en-US")}</strong>
      </div>
    </div>
  );
}