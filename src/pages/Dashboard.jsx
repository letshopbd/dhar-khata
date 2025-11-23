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
        <div className="p-0 md:p-8 pb-20 md:pb-8">
            {loading ? (
                <p>তথ্য লোড হচ্ছে...</p>
            ) : (
                <>
                    <div className="grid gap-1 md:gap-4 grid-cols-2 lg:grid-cols-4 mb-3 md:mb-8">
                        <div className="p-2 md:p-6 bg-white rounded-lg shadow border border-red-100">
                            <h3 className="text-sm md:text-lg font-semibold text-red-500">মোট বাকি</h3>
                            <p className="text-xl md:text-3xl font-bold text-red-600">৳{stats.totalDue.toLocaleString()}</p>
                        </div>
                        <div className="p-2 md:p-6 bg-white rounded-lg shadow border border-blue-100">
                            <h3 className="text-sm md:text-lg font-semibold text-blue-500">মোট মানুষ</h3>
                            <p className="text-xl md:text-3xl font-bold text-blue-600">{stats.totalPeople}</p>
                        </div>
                        <div className="p-2 md:p-6 bg-white rounded-lg shadow border border-green-100">
                            <h3 className="text-sm md:text-lg font-semibold text-green-500">মোট জমা</h3>
                            <p className="text-xl md:text-3xl font-bold text-green-600">৳{stats.totalPaid.toLocaleString()}</p>
                        </div>
                        <div className="p-2 md:p-6 bg-white rounded-lg shadow border border-gray-100">
                            <h3 className="text-sm md:text-lg font-semibold text-gray-500">সর্বমোট</h3>
                            <p className="text-xl md:text-3xl font-bold text-gray-600">৳{stats.totalAmount.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Recent Activity Section */}
                    <div className="bg-white rounded-lg shadow border p-2 md:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                <h2 className="text-lg md:text-xl font-semibold">সাম্প্রতিক কার্যক্রম</h2>
                            </div>
                            <span className="text-xs text-gray-500">সর্বশেষ ১০টি</span>
                        </div>
                        {activities.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📋</div>
                                <p className="text-gray-500 text-sm">এখনও কোনো কার্যক্রম নেই</p>
                                <p className="text-gray-400 text-xs mt-1">নতুন ধার যোগ করলে এখানে দেখা যাবে</p>
                            </div>
                        ) : (
                            <div className="space-y-2 md:space-y-3">
                                {activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="group relative flex items-start gap-3 md:gap-4 p-2 md:p-4 bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-white border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-md"
                                    >
                                        {/* Icon with background */}
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${activity.type === 'add' ? 'bg-blue-100' :
                                                activity.type === 'edit' ? 'bg-yellow-100' :
                                                    activity.type === 'paid' ? 'bg-green-100' :
                                                        activity.type === 'unpaid' ? 'bg-orange-100' :
                                                            activity.type === 'delete' ? 'bg-red-100' : 'bg-gray-100'
                                            }`}>
                                            {getActivityIcon(activity.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Activity Type Badge */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.type === 'add' ? 'bg-blue-100 text-blue-800' :
                                                        activity.type === 'edit' ? 'bg-yellow-100 text-yellow-800' :
                                                            activity.type === 'paid' ? 'bg-green-100 text-green-800' :
                                                                activity.type === 'unpaid' ? 'bg-orange-100 text-orange-800' :
                                                                    activity.type === 'delete' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {activity.type === 'add' ? 'নতুন যোগ' :
                                                        activity.type === 'edit' ? 'সম্পাদনা' :
                                                            activity.type === 'paid' ? 'পরিশোধিত' :
                                                                activity.type === 'unpaid' ? 'বাকি' :
                                                                    activity.type === 'delete' ? 'মুছে ফেলা' : 'অন্যান্য'}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className={`font-medium text-sm md:text-base mb-2 ${getActivityColor(activity.type)}`}>
                                                {activity.description}
                                            </p>

                                            {/* Timestamp with icon */}
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{formatTimestamp(activity.timestamp)}</span>
                                            </div>
                                        </div>

                                        {/* Decorative element */}
                                        <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${activity.type === 'add' ? 'bg-blue-500' :
                                                activity.type === 'edit' ? 'bg-yellow-500' :
                                                    activity.type === 'paid' ? 'bg-green-500' :
                                                        activity.type === 'unpaid' ? 'bg-orange-500' :
                                                            activity.type === 'delete' ? 'bg-red-500' : 'bg-gray-500'
                                            }`}></div>
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
