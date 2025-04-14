import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

interface Person {
  id: number;
  name: string;
  lastname: string;
  hn: string;
  age: number;
}

export default function PersonListApp() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [filters, setFilters] = useState({ name: "", lastname: "", hn: "", age: "" });
  const [sortKey, setSortKey] = useState<keyof Person | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 🔹 โหลดไฟล์อัตโนมัติจาก public/data/person_data_10000.xlsx
  useEffect(() => {
    const loadExcel = async () => {
      const res = await fetch("/data/person_data_10000.xlsx");
      const arrayBuffer = await res.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet);

      const mappedData = data.map((item, idx) => ({
        id: idx + 1,
        name: item.name || "",
        lastname: item.lastname || "",
        hn: item.hn || "",
        age: Number(item.age) || 0,
      }));
      setPersons(mappedData);
    };

    loadExcel();
  }, []);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = persons.filter((p) => {
      return (
        (!filters.name || p.name.includes(filters.name)) &&
        (!filters.lastname || p.lastname.includes(filters.lastname)) &&
        (!filters.hn || p.hn.includes(filters.hn)) &&
        (!filters.age || p.age.toString().includes(filters.age))
      );
    });

    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1;
        if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [filters, persons, sortKey, sortOrder]);

  return (
    <div className="container">
      <h1>Person List</h1>

      <div className="filters">
        <input placeholder="Filter by Name" value={filters.name} onChange={(e) => handleFilterChange("name", e.target.value)} />
        <input placeholder="Filter by Lastname" value={filters.lastname} onChange={(e) => handleFilterChange("lastname", e.target.value)} />
        <input placeholder="Filter by HN" value={filters.hn} onChange={(e) => handleFilterChange("hn", e.target.value)} />
        <input placeholder="Filter by Age" value={filters.age} onChange={(e) => handleFilterChange("age", e.target.value)} />
      </div>

      <div className="sort-buttons">
        <button onClick={() => setSortKey("name")}>Sort by Name</button>
        <button onClick={() => setSortKey("lastname")}>Sort by Lastname</button>
        <button onClick={() => setSortKey("age")}>Sort by Age</button>
        <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
          {sortOrder === "asc" ? "⬇️ Asc" : "⬆️ Desc"}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Lastname</th>
            <th>HN</th>
            <th>Age</th>
          </tr>
        </thead>
       <tbody>
  {filteredAndSorted.map((p) => (
    <tr key={p.id}>
      <td>
        <div className="main-name">
          {p.name} {p.lastname}
        </div>
        <div className="sub-info">
          <div>HN: {p.hn}</div>
          <div>Age: {p.age}</div>
        </div>
      </td>
      <td className="desktop-only">{p.name}</td>
      <td className="desktop-only">{p.lastname}</td>
      <td className="desktop-only">{p.hn}</td>
      <td className="desktop-only">{p.age}</td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
  );
}
