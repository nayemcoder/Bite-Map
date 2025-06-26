// src/pages/EditRestaurantPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams }      from "react-router-dom";
import axios                            from "axios";

export default function EditRestaurantPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const token     = localStorage.getItem("authToken");

  const [rest, setRest] = useState({
    name: "",
    description: "",
    address: "",
    contact_phone: "",
    email: "",
    cuisine_type: "",
    map: ""
  });
  const [coverFile, setCoverFile] = useState(null);
  const [tables, setTables]       = useState([]);
  const [newTable, setNewTable]   = useState({ number: "", capacity: "" });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // Load restaurant + tables
  useEffect(() => {
    if (!token) return navigate("/login");

    axios.get(`/restaurants/${id}`)
      .then(res => {
        const r = res.data;
        setRest({
          name:          r.name,
          description:   r.description,
          address:       r.address,
          contact_phone: r.contactPhone,
          email:         r.email,
          cuisine_type:  r.cuisineType,
          map:           r.mapEmbedHtml || ""
        });
      })
      .catch(() => {
        alert("Restaurant not found");
        navigate("/seller-dashboard");
      });

    axios.get(`/sellers/restaurants/${id}/tables`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setTables(res.data.data || []))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, [id, navigate, token]);

  // Field change handler
  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === "cover_image") {
      setCoverFile(files[0]);
    } else {
      setRest(prev => ({ ...prev, [name]: value }));
    }
  };

  // Save restaurant details
  const saveRestaurant = async e => {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    Object.entries(rest).forEach(([k,v]) => {
      formData.append(k, v || "");
    });
    if (coverFile) formData.append("cover_image", coverFile);

    try {
      await axios.put(`/sellers/restaurants/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Restaurant updated");
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
  };

  // Table row editing
  const updateTable = (tid, field, value) => {
    setTables(prev =>
      prev.map(t => t.id === tid ? { ...t, [field]: value } : t)
    );
  };

  // Save a table (existing row)
  const saveTable = async t => {
    try {
      await axios.post(
        `/sellers/restaurants/${id}/tables`,
        {
          table_number: t.table_number,
          capacity:     t.capacity
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Table saved");
    } catch {
      alert("Could not save table");
    }
  };

  // Delete a table
  const deleteTable = async tid => {
    if (!window.confirm("Delete this table?")) return;
    try {
      await axios.delete(
        `/sellers/restaurants/${id}/tables/${tid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTables(prev => prev.filter(t => t.id !== tid));
    } catch {
      alert("Could not delete table");
    }
  };

  // Add a new table
  const addTable = async () => {
    if (!newTable.number || !newTable.capacity) return;
    try {
      const res = await axios.post(
        `/sellers/restaurants/${id}/tables`,
        {
          table_number: newTable.number,
          capacity:     newTable.capacity
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTables(prev => [
        ...prev,
        { id: res.data.tableId, table_number: newTable.number, capacity: newTable.capacity }
      ]);
      setNewTable({ number: "", capacity: "" });
    } catch {
      alert("Could not add table");
    }
  };

  if (loading) {
    return <p className="p-6 text-center">Loading…</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow space-y-6">
      {/* Edit Restaurant Form */}
      <form onSubmit={saveRestaurant} encType="multipart/form-data">
        <h2 className="text-2xl font-bold mb-4">Edit Restaurant</h2>
        {error && <p className="mb-4 text-red-500">{error}</p>}

        {[
          ["name", "Name"],
          ["description", "Description", "textarea"],
          ["address", "Address"],
          ["contact_phone", "Phone"],
          ["email", "Email"],
          ["cuisine_type", "Cuisine Type"]
        ].map(([key,label,type]) =>
          type === "textarea" ? (
            <div key={key} className="mb-4">
              <label className="block mb-1">{label}</label>
              <textarea
                name={key}
                value={rest[key]}
                onChange={handleChange}
                rows={3}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          ) : (
            <div key={key} className="mb-4">
              <label className="block mb-1">{label}</label>
              <input
                name={key}
                type={key==="email"?"email":"text"}
                value={rest[key]}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          )
        )}

        {/* Map Embed HTML */}
        <div className="mb-4">
          <label className="block mb-1">Map Embed HTML</label>
          <textarea
            name="map"
            value={rest.map}
            onChange={handleChange}
            rows={4}
            placeholder="<iframe src='…'></iframe>"
            className="w-full border p-2 rounded font-mono text-sm"
          />
          <p className="text-gray-500 text-xs mt-1">
            Paste your &lt;iframe&gt; snippet here.
          </p>
        </div>

        {/* Cover Image Upload */}
        <div className="mb-4">
          <label className="block mb-1">Cover Image</label>
          <input
            type="file"
            name="cover_image"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition"
        >
          Save Restaurant
        </button>
      </form>

      {/* Tables Management */}
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-xl font-semibold mb-3">Tables</h3>
        <table className="w-full table-auto mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Number</th>
              <th className="border p-2">Capacity</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.map(t => (
              <tr key={t.id} className="hover:bg-gray-200">
                <td className="border p-2">
                  <input
                    value={t.table_number}
                    onChange={e => updateTable(t.id, "table_number", e.target.value)}
                    className="w-full border p-1 rounded text-sm"
                  />
                </td>
                <td className="border p-2">
                  <input
                    value={t.capacity}
                    onChange={e => updateTable(t.id, "capacity", e.target.value)}
                    className="w-full border p-1 rounded text-sm"
                  />
                </td>
                <td className="border p-2 text-center space-x-2">
                  <button
                    onClick={() => saveTable(t)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => deleteTable(t.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {/* New table row */}
            <tr>
              <td className="border p-2">
                <input
                  placeholder="Number"
                  value={newTable.number}
                  onChange={e => setNewTable(nt => ({ ...nt, number: e.target.value }))}
                  className="w-full border p-1 rounded text-sm"
                />
              </td>
              <td className="border p-2">
                <input
                  placeholder="Capacity"
                  value={newTable.capacity}
                  onChange={e => setNewTable(nt => ({ ...nt, capacity: e.target.value }))}
                  className="w-full border p-1 rounded text-sm"
                />
              </td>
              <td className="border p-2 text-center">
                <button
                  onClick={addTable}
                  className="px-3 py-1 bg-green-600 text-white rounded-full text-xs hover:bg-green-700"
                >
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}