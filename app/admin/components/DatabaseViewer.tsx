"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database, Table, Search, RefreshCw } from "lucide-react";

interface TableInfo {
  name: string;
  schema: string;
}

export default function DatabaseViewer() {
  const supabase = createClient();
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Predefined tables from your app
  const tables = [
    { name: "bl_crm_contacts", label: "CRM Contacts" },
    { name: "bl_crm_activities", label: "CRM Activities" },
    { name: "bl_crm_deals", label: "CRM Deals" },
    { name: "bl_crm_ai_automations", label: "CRM AI Automations" },
  ];

  useEffect(() => {
    if (selectedTable) {
      fetchTableData();
    }
  }, [selectedTable]);

  const fetchTableData = async () => {
    if (!selectedTable) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(selectedTable)
        .select("*")
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        setColumns(Object.keys(data[0]));
        setTableData(data);
      } else {
        setColumns([]);
        setTableData([]);
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
      setColumns([]);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = tableData.filter((row) => {
    if (!searchQuery) return true;
    return Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "string" && value.length > 50) {
      return value.substring(0, 50) + "...";
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6" />
              Database Viewer
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Browse and inspect database tables
            </p>
          </div>

          <div className="flex gap-3">
            {selectedTable && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in table..."
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <button
                  onClick={fetchTableData}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </>
            )}
          </div>
        </div>

        {/* Table Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Table
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tables.map((table) => (
              <button
                key={table.name}
                onClick={() => setSelectedTable(table.name)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedTable === table.name
                    ? "bg-white text-black"
                    : "bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
              >
                <Table className="w-4 h-4" />
                {table.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Info */}
        {selectedTable && (
          <div className="mb-4 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Viewing Table</p>
                <p className="font-mono text-lg font-semibold">{selectedTable}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Total Rows</p>
                <p className="text-2xl font-bold">{filteredData.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table Data */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : selectedTable && tableData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="text-left py-3 px-4 text-sm font-semibold text-slate-400 whitespace-nowrap"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    {columns.map((column) => (
                      <td
                        key={column}
                        className="py-3 px-4 text-sm text-slate-300 whitespace-nowrap"
                      >
                        <div className="max-w-xs overflow-hidden text-ellipsis">
                          {formatValue(row[column])}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredData.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : selectedTable ? (
          <div className="text-center py-12">
            <Table className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No data in this table</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Select a table to view its data</p>
          </div>
        )}
      </div>

      {/* Table Statistics */}
      {selectedTable && tableData.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Table Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Total Rows</p>
              <p className="text-2xl font-bold">{tableData.length}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Total Columns</p>
              <p className="text-2xl font-bold">{columns.length}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Filtered Results</p>
              <p className="text-2xl font-bold">{filteredData.length}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Table Name</p>
              <p className="text-sm font-mono font-semibold truncate">
                {selectedTable}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
