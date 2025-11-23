import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Clock } from "lucide-react";

export default function Dashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalDue: 0,
        totalPaid: 0,
        totalPeople: 0,
        totalAmount: 0,
    });
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }
        const unsubscribe = onSnapshot(collection(db, "rests"), (snapshot) => {
            const rests = snapshot.docs.map((doc) => doc.data());

            const uniquePeople = new Set(rests.map((rest) => rest.name.toLowerCase().trim())).size;
            const totalAmount = rests.reduce((sum, rest) => sum + (parseFloat(rest.amount) || 0), 0);
            const totalPaid = rests
                .filter((rest) => rest.paid)
                .reduce((sum, rest) => sum + (parseFloat(rest.amount) || 0), 0);
            const totalDue = totalAmount - totalPaid;

            setStats({
                totalDue,
                totalPaid,
                totalPeople: uniquePeople,
                totalAmount,
            });
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!db) return;

        const q = query(
            collection(db, "activities"),
            orderBy("timestamp", "desc"),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activitiesData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setActivities(activitiesData);
        });

        return unsubscribe;
    }, []);

    async function handleLogout() {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Failed to log out", error);
        }
    }

    const getActivityIcon = (type) => {
        switch (type) {
            case 'add':
                return '➕';
            case 'edit':
                return '✏️';
            case 'paid':
                return '✅';
            case 'unpaid':
                return '⏳';
            case 'delete':
                return '🗑️';
            default:
                return '📝';
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'add':
                return 'text-blue-600';
            case 'edit':
                return 'text-yellow-600';
            case 'paid':
                return 'text-green-600';
            case 'unpaid':
                return 'text-orange-600';
            case 'delete':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'এখনই';
        if (diffMins < 60) return `${diffMins} মিনিট আগে`;
        if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
        if (diffDays < 7) return `${diffDays} দিন আগে`;
        return date.toLocaleDateString('bn-BD');
    };

    return (
        <div className="p-4 md:p-8 pb-20 md:pb-8">
            <div className="flex justify-between items-center mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold">ড্যাশবোর্ড</h1>
            </div>

            {loading ? (
                <p>তথ্য লোড হচ্ছে...</p>
            ) : (
                <>
                    <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
                        <div className="p-4 md:p-6 bg-white rounded-lg shadow border border-red-100">
                            <h3 className="text-sm md:text-lg font-semibold text-red-500">মোট বাকি</h3>
                            <p className="text-xl md:text-3xl font-bold text-red-600">৳{stats.totalDue.toLocaleString()}</p>
                        </div>
                        <div className="p-4 md:p-6 bg-white rounded-lg shadow border border-blue-100">
                            <h3 className="text-sm md:text-lg font-semibold text-blue-500">মোট মানুষ</h3>
                            <p className="text-xl md:text-3xl font-bold text-blue-600">{stats.totalPeople}</p>
                        </div>
                        <div className="p-4 md:p-6 bg-white rounded-lg shadow border border-green-100">
                            <h3 className="text-sm md:text-lg font-semibold text-green-500">মোট জমা</h3>
                            <p className="text-xl md:text-3xl font-bold text-green-600">৳{stats.totalPaid.toLocaleString()}</p>
                        </div>
                        <div className="p-4 md:p-6 bg-white rounded-lg shadow border border-gray-100">
                            <h3 className="text-sm md:text-lg font-semibold text-gray-500">সর্বমোট</h3>
                            <p className="text-xl md:text-3xl font-bold text-gray-600">৳{stats.totalAmount.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Recent Activity Section */}
                    <div className="bg-white rounded-lg shadow border p-4 md:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg md:text-xl font-semibold">সাম্প্রতিক কার্যক্রম</h2>
                        </div>
                        {activities.length === 0 ? (
                            <p className="text-gray-500 text-sm">কোনো কার্যক্রম নেই</p>
                        ) : (
                            <div className="space-y-3">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium text-sm md:text-base ${getActivityColor(activity.type)}`}>
                                                {activity.description}
                                            </p>
                                            <p className="text-xs md:text-sm text-gray-500 mt-1">
                                                {formatTimestamp(activity.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
