import { useEffect, useState } from "react";
import {
  loadPageHrFilterOptions,
  type PageHrFilters,
  type PageHrFilterKey,
} from "../services/pageHrKpi";

type Props = {
  filters: PageHrFilters;
  onChange: (next: PageHrFilters) => void;
};

const filterFields: {
  key: PageHrFilterKey;
  label: string;
}[] = [
  { key: "year", label: "Năm" },
  { key: "month", label: "Tháng" },
  { key: "project", label: "Dự án" },
  { key: "channel", label: "Kênh" },
  { key: "region", label: "Miền" },
  { key: "province", label: "Tỉnh" },
  { key: "position", label: "Vị trí" },
  { key: "manager1", label: "Quản lý cấp 1" },
  { key: "manager2", label: "Quản lý cấp 2" },
];

export default function StaffingFilterBar({
  filters,
  onChange,
}: Props) {
  const [options, setOptions] = useState<
    Partial<Record<PageHrFilterKey, string[]>>
  >({});

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    loadPageHrFilterOptions()
      .then((data) => {
        if (active) {
          setOptions(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : String(err)
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function updateFilter(key: PageHrFilterKey, raw: string) {
    if (key === "year") {
      if (!raw) return;

      onChange({
        ...filters,
        year: Number(raw),
      });
    } else if (key === "month") {
      onChange({
        ...filters,
        month: raw === "" ? null : Number(raw),
      });
    } else {
      onChange({
        ...filters,
        [key]: raw === "" ? null : raw,
      });
    }
  }

  return (
    <div
      style={{
        background: "#f3f7fc",
        borderBottom: "1px solid #dbe5f1",
      }}
    >
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, minmax(135px, 1fr))",
          gap: 8,
          padding: "12px 16px",
          overflowX: "auto",
        }}
      >
        {filterFields.map((field) => {
          const selected = filters[field.key];

          const selectedValue =
            selected === null ? "" : String(selected);

          const fallback =
            field.key === "year"
              ? [String(filters.year)]
              : field.key === "month"
                ? Array.from(
                    { length: 12 },
                    (_, i) => String(i + 1)
                  )
                : [];

          const choices = Array.from(
            new Set([
              ...fallback,
              ...(options[field.key] ?? []),
              ...(selectedValue ? [selectedValue] : []),
            ])
          );

          return (
            <label
              key={field.key}
              style={{
                display: "grid",
                gap: 5,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#153b73",
                }}
              >
                {field.label}
              </span>

              <select
                value={selectedValue}
                onChange={(e) =>
                  updateFilter(field.key, e.target.value)
                }
                style={{
                  width: "100%",
                  height: 36,
                  padding: "8px",
                  border: "1px solid #b9cfee",
                  borderRadius: 5,
                  background: "#ffffff",
                  color: "#153b73",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {field.key !== "year" && (
                  <option value="">
                    {field.key === "month"
                      ? "Tất cả / YTD"
                      : field.key === "project"
                        ? "Tất cả dự án"
                        : "Tất cả"}
                  </option>
                )}

                {choices.map((value) => (
                  <option key={value} value={value}>
                    {field.key === "month"
                      ? "T" + value.padStart(2, "0")
                      : value}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </section>

      {error && (
        <div
          role="alert"
          style={{
            color: "#b91c1c",
            padding: "4px 16px 10px",
            fontSize: 12,
          }}
        >
          Chưa tải được danh sách Filter từ Power BI:
          {" "}{error}
        </div>
      )}
    </div>
  );
}