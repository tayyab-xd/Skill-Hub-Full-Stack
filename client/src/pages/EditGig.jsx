import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EditGig = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [gigData, setGigData] = useState({
    title: "",
    description: "",
    price: "",
    deliveryTime: "",
    category: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);

  // fetch gig details
  useEffect(() => {
    const fetchGig = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/gigs/${id}`);
        setGigData(res.data);
      } catch (err) {
        toast.error("Failed to fetch gig details");
      }
    };
    fetchGig();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGigData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setGigData((prev) => ({ ...prev, images: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(gigData).forEach((key) => {
        if (key === "images") {
          gigData.images.forEach((img) => formData.append("images", img));
        } else {
          formData.append(key, gigData[key]);
        }
      });

      await axios.put(`${import.meta.env.VITE_API_URL}/api/gigs/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Gig updated successfully!");
      navigate("/my-gigs");
    } catch (err) {
      toast.error("Failed to update gig");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Gig</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            value={gigData.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full border rounded-lg p-2"
            required
          />

          <textarea
            name="description"
            value={gigData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border rounded-lg p-2"
            rows="4"
            required
          />

          <input
            type="number"
            name="price"
            value={gigData.price}
            onChange={handleChange}
            placeholder="Price (PKR)"
            className="w-full border rounded-lg p-2"
            required
          />

          <input
            type="text"
            name="deliveryTime"
            value={gigData.deliveryTime}
            onChange={handleChange}
            placeholder="Delivery Time (e.g. 3 days)"
            className="w-full border rounded-lg p-2"
            required
          />

          <input
            type="text"
            name="category"
            value={gigData.category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full border rounded-lg p-2"
            required
          />

          <input
            type="file"
            name="images"
            onChange={handleImageChange}
            multiple
            className="w-full border rounded-lg p-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Gig"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditGig;
