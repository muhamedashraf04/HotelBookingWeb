import Header from "@/components/Header/Header";
import { useState, useEffect } from "react";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone?: string;
};

function RemoveCustomer(){
   const [customers, setCustomers] = useState<Customer[]>([]);
   const [search, setSearch] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const [rowsPerPage] = useState(5);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");
   const [form, setForm] = useState({ id: 0, name: "", email: "", phone: "" });
   const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });

   
   const fetchCustomers = async () => {
      setLoading(true);
      setError("");
      try {
         const res = await fetch("http://localhost:5000/api/customers");
         if (!res.ok) throw new Error("Failed to fetch customers");
         const data = await res.json();
         setCustomers(data);
      } catch (err) {
         setError((err as Error).message);
      } finally {
        setLoading(false);
      }
   };

   useEffect(() => {
      fetchCustomers();
   }, []);

   
   const handleDelete = async (id:number) => {
      if (!window.confirm("Are you sure you want to remove this customer?")) return;

      try {
         await fetch(`http://localhost:5000/api/customers/${id}`, {
            method: "DELETE",
         });

         
         setCustomers(customers.filter((c) => c.id !== id));
      } catch (err) {
         setError("Error deleting customer:");
      }
   };

const handleSubmit = async (e:any) => {
      e.preventDefault();

      
      if (!form.name || !form.email || !form.phone) {
         setError("All fields are required");
         return;
      }
      if (!/\S+@\S+\.\S+/.test(form.email)) {
         setError("Invalid email format");
         return;
      }
      if (!/^\d+$/.test(form.phone)) {
         setError("Phone must contain only numbers");
         return;
      }

      setError("");
      try {
         if (form.id) {
            
            if (!window.confirm("Are you sure you want to update this customer?")) return;

            const res = await fetch(`http://localhost:5000/api/customers/${form.id}`, {
               method: "PUT",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Failed to update customer");

            setCustomers(customers.map((c) => (c.id === form.id ? form as Customer : c)));

         } else {
            
            const res = await fetch("http://localhost:5000/api/customers", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Failed to add customer");

            const newCustomer = await res.json();
            setCustomers([...customers, newCustomer]);
         }
         setForm({ id: 0, name: "", email: "", phone: "" });
      } catch (err) {
         setError((err as Error).message);
      }
   };

   
   const handleSort = (key:any) => {
      let direction = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
         direction = "desc";
      }
      setSortConfig({ key, direction });
   };


const filteredCustomers = customers.filter((c:any) =>
      c.id?.toString().includes(search) ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toString().includes(search)
   );

const indexOfLast = currentPage * rowsPerPage;
   const indexOfFirst = indexOfLast - rowsPerPage;
   const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);
   const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);

   const exportCSV = () => {
      const headers = ["ID", "Name", "Email", "Phone"];
      const rows = customers.map((c) => [c.id, c.name, c.email, c.phone]);
      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customers.csv";
      a.click();
   };

   return(
      <>
         <Header/>
         <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Customer Management</h2>

{/* Error */}
            {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

            {/* Add / Edit Form */}
            <form onSubmit={handleSubmit} className="mb-6 space-y-2">
               <input
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
               />
               <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
               />
               <input
                  type="text"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="border px-3 py-2 rounded w-full"
               />
               <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
               >
                  {form.id ? "Update Customer" : "Add Customer"}
               </button>
               {form.id && (
                  <button
                     type="button"
                     onClick={() => setForm({ id: 0, name: "", email: "", phone: "" })}
                     className="ml-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                     Cancel
                  </button>
               )}
            </form>

 {/* Search + Export */}
            <div className="flex justify-between items-center mb-4">
               <input
                  type="text"
                  placeholder="Search by ID, Name or Phone..."
                  value={search}
                  onChange={(e) => {
                     setSearch(e.target.value);
                     setCurrentPage(1);
                  }}
                  className="border px-3 py-2 rounded w-1/2"
               />
               <button
                  onClick={exportCSV}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
               >
                  Export CSV
               </button>
            </div>

   
            {/* Table */}
            {loading ? (
               <p>Loading customers...</p>
            ) : currentCustomers.length === 0 ? (
               <p>No customers found.</p>
            ) : (
               <table className="min-w-full border border-gray-200 shadow-lg rounded-lg">
                  <thead>
                     <tr className="bg-gray-100">
                        {["id", "name", "email", "phone"].map((key) => (
                           <th
                              key={key}
                              className="px-4 py-2 border cursor-pointer"
                              onClick={() => handleSort(key)}
                           >
                              {key.toUpperCase()}{" "}
                              {sortConfig.key === key ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                           </th>
                        ))}
                        <th className="px-4 py-2 border">Actions</th>
                     </tr>
                  </thead>
                  <tbody>


                {currentCustomers.map((customer:any) => (
                     <tr key={customer.id} className="hover:bg-gray-50">
                           <td className="px-4 py-2 border">{customer.id}</td>
                           <td className="px-4 py-2 border">{customer.name}</td>
                           <td className="px-4 py-2 border">{customer.email}</td>
                           <td className="px-4 py-2 border">{customer.phone}</td>
                           <td className="px-4 py-2 border text-center space-x-2">

 <button
                                 onClick={() => setForm(customer)}
                                 className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                              >
                                 Edit
                              </button>

                    
                        <button
                           onClick={() => handleDelete(customer.id)}
                           className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                           Remove
                        </button>
                        </td>
                        </tr>
        
                  
                  
                    
                  ))}
                  </tbody>
                 </table>
            )}
               
 {/* Pagination */}
            {totalPages > 1 && (
               <div className="flex justify-between items-center mt-4">
                  <button
                     disabled={currentPage === 1}
                     onClick={() => setCurrentPage(currentPage - 1)}
                     className={`px-4 py-2 rounded ${
                        currentPage === 1
                           ? "bg-gray-300 cursor-not-allowed"
                           : "bg-blue-500 text-white hover:bg-blue-600"
                     }`}
                  >
                     Previous
                  </button>
                  <span>
                     Page {currentPage} of {totalPages}
                  </span>
                  <button
                     disabled={currentPage === totalPages}
                     onClick={() => setCurrentPage(currentPage + 1)}
                     className={`px-4 py-2 rounded ${
                        currentPage === totalPages
                           ? "bg-gray-300 cursor-not-allowed"
                           : "bg-blue-500 text-white hover:bg-blue-600"
                     }`}
                  >
                     Next
                  </button>
               </div>

            )}
         </div>
      </>
   );
}

export default RemoveCustomer;
