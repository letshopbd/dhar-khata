import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import RestTable from "@/components/RestTable";
import RestForm from "@/components/RestForm";
import { collection, onSnapshot, doc, deleteDoc, updateDoc, query, orderBy, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AllRests() {
    const navigate = useNavigate();
    const [rests, setRests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRest, setEditingRest] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }
        const q = query(collection(db, "rests"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const restsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setRests(restsData);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!db || !deleteId) return;
        try {
            const restToDelete = rests.find(r => r.id === deleteId);
            await deleteDoc(doc(db, "rests", deleteId));

            // Log activity
            if (restToDelete) {
                await addDoc(collection(db, "activities"), {
                    type: 'delete',
                    description: `ধার মুছে ফেলা হয়েছে: ${restToDelete.name} - ৳${restToDelete.amount}`,
                    timestamp: new Date(),
                });
            }

            setDeleteId(null);
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert("Failed to delete record");
        }
    };

    const handleTogglePaid = async (rest) => {
        if (!db) return;
        try {
            const newPaidStatus = !rest.paid;
            await updateDoc(doc(db, "rests", rest.id), {
                paid: newPaidStatus,
            });

            // Log activity
            await addDoc(collection(db, "activities"), {
                type: newPaidStatus ? 'paid' : 'unpaid',
                description: newPaidStatus
                    ? `পরিশোধ করা হয়েছে: ${rest.name} - ৳${rest.amount}`
                    : `বাকি করা হয়েছে: ${rest.name} - ৳${rest.amount}`,
                timestamp: new Date(),
            });
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    const handleEdit = (rest) => {
        setEditingRest(rest);
    };

    const handleUpdateRest = async (data) => {
        if (!db) return;
        try {
            await updateDoc(doc(db, "rests", editingRest.id), data);

            // Log activity
            await addDoc(collection(db, "activities"), {
                type: 'edit',
                description: `তথ্য পরিবর্তন করা হয়েছে: ${data.name} - ৳${data.amount}`,
                timestamp: new Date(),
            });

            setEditingRest(null);
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    return (
        <div className="p-4 md:p-8 pb-20 md:pb-8">
            {loading ? (
                <p>তথ্য লোড হচ্ছে...</p>
            ) : (
                <div className="space-y-8 md:space-y-12">
                    <div>
                        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-red-600">বাকি তালিকা (Due)</h2>
                        <RestTable
                            rests={rests.filter(r => !r.paid)}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onTogglePaid={handleTogglePaid}
                        />
                    </div>

                    <div>
                        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-green-600">পরিশোধিত তালিকা (Paid)</h2>
                        <RestTable
                            rests={rests.filter(r => r.paid)}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onTogglePaid={handleTogglePaid}
                        />
                    </div>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingRest} onOpenChange={(open) => !open && setEditingRest(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>তথ্য পরিবর্তন করুন</DialogTitle>
                    </DialogHeader>
                    {editingRest && (
                        <RestForm
                            initialData={editingRest}
                            onSubmit={handleUpdateRest}
                            title=""
                            className="border-0 shadow-none p-0"
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>মুছে ফেলার নিশ্চিতকরণ</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>আপনি কি নিশ্চিত যে আপনি এই তথ্যটি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।</p>
                    </div>
                    <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={() => setDeleteId(null)}>বাতিল</Button>
                        <Button variant="destructive" onClick={confirmDelete}>মুছুন</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
