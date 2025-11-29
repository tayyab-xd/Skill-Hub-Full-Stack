import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const gigId = searchParams.get("gigId");
  

  useEffect(() => {
    if (gigId) {
      axios.post(`${import.meta.env.VITE_API_URL}/gig/mark-paid/${gigId}`)
        .then(res => {})
        .catch(err => console.error(err));
    }
  }, [gigId]);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-green-600">✅ Payment Successful!</h1>
      <p>Your gig has been updated.</p>
    </div>
  );
}
