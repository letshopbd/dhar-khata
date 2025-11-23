import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import RestForm from "@/components/RestForm";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AddRest() {
  const navigate = useNavigate();

  const handleAddRest = async (data) => {
    try {
      await addDoc(collection(db, "rests"), data);

      // Log activity
      await addDoc(collection(db, "activities"), {
        type: 'add',
        description: `নতুন বাকি যোগ করা হয়েছে: ${data.name} - ৳${data.amount}`,
        timestamp: new Date(),
      });

      navigate("/");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to add rest");
    }
  };

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <RestForm title="নতুন ধারের তথ্য" onSubmit={handleAddRest} className="max-w-full mx-0" />
    </div>
  );
}
