import { useState } from "react";

// 10 DIM CHO BIỂU ĐỒ DROPDOWN
const chartGroups = [
  "Miền",
  "Tỉnh",
  "Vị trí",
  "Quản lý cấp 1",
  "Quản lý cấp 2",
  "Giới tính",
  "Nhóm tuổi",
  "Học vấn",
  "Thâm niên",
  "Trạng thái NV",
];

// 7 DIM CHO HAI BẢNG PHÂN TÍCH CÒN LẠI
const tableGroups = [
  "Miền",
  "Tỉnh",
  "Vị trí",
  "Quản lý cấp 1",
  "Quản lý cấp 2",
  "Nhóm tuổi",
  "Trạng thái NV",
];

// 5 DIM RIÊNG CHO BẢNG ĐIỂM NÓNG
const hotspotGroups = [
  "Miền",
  "Tỉnh",
  "Vị trí",
  "Quản lý cấp 1",
  "Quản lý cấp 2",
];

type Props = {
  variant: "select" | "tabs";
  preset?: "default" | "hotspots";

  // Chế độ chọn một nhóm
  onChange?: (value: string) => void;

  // Chế độ chọn kết hợp nhiều nhóm
  multiSelect?: boolean;
  selectedGroups?: string[];
  onMultiChange?: (values: string[]) => void;
};

export default function HeadcountGroupControl({
  variant,
  preset = "default",
  onChange,
  multiSelect = false,
  selectedGroups = ["Miền"],
  onMultiChange,
}: Props) {
  const [selected, setSelected] = useState("Miền");

  const handleSelect = (value: string) => {
    setSelected(value);
    onChange?.(value);
  };

  // DROPDOWN CỦA CÁC BIỂU ĐỒ: GIỮ NGUYÊN
  if (variant === "select") {
    return (
      <select
        aria-label="Chọn nhóm phân tích biểu đồ"
        value={selected}
        onChange={(e) => handleSelect(e.target.value)}
        style={{
          width: 115,
          height: 28,
          padding: "0 10px",
          border: "1px solid #a8c5ea",
          borderRadius: 14,
          backgroundColor: "#ffffff",
          color: "#153b73",
          fontSize: 11,
          cursor: "pointer",
        }}
      >
        {chartGroups.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>
    );
  }

  // XÁC ĐỊNH DANH SÁCH DIMENSION
  const groups =
    preset === "hotspots" ? hotspotGroups : tableGroups;

  // CHẾ ĐỘ CHỌN NHIỀU - ÁP DỤNG CHO CẢ 3 BẢNG
  if (multiSelect) {
    const activeGroups = groups.filter((group) =>
      selectedGroups.includes(group)
    );

    const allSelected =
      activeGroups.length === groups.length;

    const toggleGroup = (group: string) => {
      const next = groups.filter((item) =>
        item === group
          ? !activeGroups.includes(item)
          : activeGroups.includes(item)
      );

      // Không cho phép bỏ chọn hết
      if (next.length === 0) return;

      onMultiChange?.(next);
    };

    const toggleAll = () => {
      onMultiChange?.(
        allSelected ? ["Miền"] : [...groups]
      );
    };

    const buttonStyle = (active: boolean) => ({
      height: 26,
      padding: "0 9px",
      border: "1px solid #a8c5ea",
      borderRadius: 14,
      backgroundColor: active ? "#0865d9" : "#ffffff",
      color: active ? "#ffffff" : "#153b73",
      fontSize: 10,
      fontWeight: active ? 700 : 400,
      whiteSpace: "nowrap" as const,
      cursor: "pointer" as const,
      flexShrink: 0,
    });

    return (
      <div
        style={{
          width: "100%",
          minWidth: 0,
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 4,
            width: "max-content",
            minWidth: "100%",
          }}
        >
          {groups.map((group) => {
            const active = activeGroups.includes(group);

            return (
              <button
                key={group}
                type="button"
                aria-pressed={active}
                onClick={() => toggleGroup(group)}
                style={buttonStyle(active)}
              >
                {group}
              </button>
            );
          })}

          <button
            type="button"
            aria-pressed={allSelected}
            onClick={toggleAll}
            title={
              allSelected
                ? "Quay về chỉ chọn Miền"
                : "Chọn tất cả Dimension"
            }
            style={{
              ...buttonStyle(allSelected),
              borderColor: "#0865d9",
              backgroundColor: allSelected
                ? "#0865d9"
                : "#e8f1fb",
              color: allSelected
                ? "#ffffff"
                : "#0865d9",
              fontWeight: 700,
            }}
          >
            Tất cả
          </button>
        </div>
      </div>
    );
  }

  // CHẾ ĐỘ CHỌN MỘT NHÓM - GIỮ TƯƠNG THÍCH CŨ
  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${groups.length}, 90px)`,
          gap: 4,
          width: "max-content",
          marginLeft: "auto",
        }}
      >
        {groups.map((group) => {
          const active = selected === group;

          return (
            <button
              key={group}
              type="button"
              aria-pressed={active}
              onClick={() => handleSelect(group)}
              style={{
                width: 90,
                height: 28,
                padding: "0 4px",
                border: "1px solid #a8c5ea",
                borderRadius: 14,
                backgroundColor: active
                  ? "#0865d9"
                  : "#ffffff",
                color: active ? "#ffffff" : "#153b73",
                fontSize: 10,
                fontWeight: active ? 700 : 400,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {group}
            </button>
          );
        })}
      </div>
    </div>
  );
}