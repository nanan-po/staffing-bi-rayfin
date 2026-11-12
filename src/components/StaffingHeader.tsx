const menuItems = [
  "Tổng quan",
  "Quản trị nhân sự",
  "Tuyển dụng",
  "Chấm công",
  "Tiền lương",
  "Cài đặt",
];

export default function StaffingHeader() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 20,
        padding: "16px 20px",
        background: "#ffffff",
        borderBottom: "1px solid #dbe5f1",
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 800,
            color: "#153b73",
          }}
        >
          HEADCOUNT MANAGEMENT
        </h1>

        <p
          style={{
            margin: "4px 0 0",
            fontSize: 12,
            color: "#6b84a6",
          }}
        >
          Nhân sự hiện tại & Cơ cấu nhân sự
        </p>
      </div>

      <nav
        aria-label="Điều hướng Staffing"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {menuItems.map((item) => {
          const active = item === "Quản trị nhân sự";

          return (
            <span
              key={item}
              aria-current={active ? "page" : undefined}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: active ? "#0865d9" : "transparent",
                color: active ? "#ffffff" : "#153b73",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
              }}
            >
              {item}
            </span>
          );
        })}
      </nav>
    </header>
  );
}