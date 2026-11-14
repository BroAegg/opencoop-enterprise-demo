import React, { useState } from 'react';
import { Gift, Sparkles, X } from 'lucide-react';

export default function PosLoyaltyRedeemSection({
    selectedMember = null,
    loyaltyRewards = [],
    loyaltyConfig = null,
    totalAmount = 0,
    selectedRewardId = null,
    setSelectedRewardId,
    customRedeemPoints = 0,
    setCustomRedeemPoints,
}) {
    const [showCustom, setShowCustom] = useState(false);

    if (
        !selectedMember
        || selectedMember.is_member_koperasi
        || loyaltyConfig?.enabled === false
        || Number(selectedMember.points || 0) <= 0
    ) {
        return null;
    }

    const memberPoints = Number(selectedMember.points || 0);
    const pointValue = Number(loyaltyConfig?.point_value_rupiah || 1);
    const minRedeem = Number(loyaltyConfig?.min_redeem_points || 10);

    const activeReward = loyaltyRewards.find((r) => r.id === selectedRewardId) || null;
    const isRedeemActive = Boolean(activeReward) || Number(customRedeemPoints) > 0;

    const handleSelectReward = (reward) => {
        if (reward.points_cost > memberPoints) return;
        setCustomRedeemPoints(0);
        setShowCustom(false);
        setSelectedRewardId(selectedRewardId === reward.id ? null : reward.id);
    };

    const handleClear = () => {
        setSelectedRewardId(null);
        setCustomRedeemPoints(0);
    };

    return (
        <div className="mb-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Gift className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-900 truncate">Tukar Poin Rewards</p>
                        <p className="text-[10px] text-amber-800 font-medium">
                            Saldo: <span className="font-bold">{memberPoints.toLocaleString('id-ID')} Poin</span>
                        </p>
                    </div>
                </div>
                {isRedeemActive ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 hover:text-rose-700 bg-white px-2 py-1 rounded-lg border border-rose-200 cursor-pointer"
                    >
                        <X className="w-3 h-3" />
                        Batal
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedRewardId(null);
                            setShowCustom((prev) => !prev);
                        }}
                        className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                    >
                        {showCustom ? 'Pilih Katalog' : 'Input Poin Manual'}
                    </button>
                )}
            </div>

            {!showCustom ? (
                <div className="flex flex-wrap gap-1.5">
                    {loyaltyRewards.length > 0 ? (
                        loyaltyRewards.map((reward) => {
                            const affordable = memberPoints >= Number(reward.points_cost || 0);
                            const isSelected = selectedRewardId === reward.id;

                            return (
                                <button
                                    key={reward.id}
                                    type="button"
                                    disabled={!affordable}
                                    onClick={() => handleSelectReward(reward)}
                                    className={`px-2.5 py-1.5 rounded-xl text-left border text-[11px] transition-all ${
                                        isSelected
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs cursor-pointer'
                                            : affordable
                                                ? 'bg-white text-slate-700 border-amber-200 hover:border-amber-400 cursor-pointer'
                                                : 'bg-white/50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                                    }`}
                                >
                                    <span className="font-bold block leading-tight">{reward.name}</span>
                                    <span className={`text-[10px] ${isSelected ? 'text-amber-300' : 'text-amber-700'}`}>
                                        {reward.points_cost} pt · Diskon Rp {Math.min(totalAmount, Number(reward.discount_amount || 0)).toLocaleString('id-ID')}
                                    </span>
                                </button>
                            );
                        })
                    ) : (
                        <p className="text-[10px] text-slate-500">Belum ada katalog reward aktif.</p>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min={minRedeem}
                        max={memberPoints}
                        value={customRedeemPoints || ''}
                        onChange={(e) => {
                            setSelectedRewardId(null);
                            const val = Math.max(0, Math.min(memberPoints, Number(e.target.value) || 0));
                            setCustomRedeemPoints(val);
                        }}
                        placeholder={`Min ${minRedeem} poin (1 pt = Rp ${pointValue})`}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <span className="text-[11px] font-bold text-emerald-700 whitespace-nowrap">
                        -Rp {Math.min(totalAmount, (Number(customRedeemPoints) || 0) * pointValue).toLocaleString('id-ID')}
                    </span>
                </div>
            )}

            {isRedeemActive && (
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 pt-0.5">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span>
                        {activeReward
                            ? `${activeReward.name} diterapkan (-${activeReward.points_cost} Poin)`
                            : `Penukaran ${customRedeemPoints} poin diterapkan (-Rp ${Math.min(totalAmount, customRedeemPoints * pointValue).toLocaleString('id-ID')})`}
                    </span>
                </div>
            )}
        </div>
    );
}

