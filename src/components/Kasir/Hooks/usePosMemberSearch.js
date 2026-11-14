import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * usePosMemberSearch: Debounced Member Lookup Hook.
 * Isolates member search state and network debounce from the main POS tree.
 */
export function usePosMemberSearch() {
    const [memberQuery, setMemberQuery] = useState('');
    const [memberResults, setMemberResults] = useState([]);
    const [isSearchingMember, setIsSearchingMember] = useState(false);

    useEffect(() => {
        const q = memberQuery.trim();
        if (q.length < 2) {
            setMemberResults([]);
            return;
        }

        const timer = setTimeout(() => {
            setIsSearchingMember(true);
            axios.get(`/kasir/api/members/search?q=${encodeURIComponent(q)}`)
                .then(res => setMemberResults(res.data || []))
                .catch(() => setMemberResults([]))
                .finally(() => setIsSearchingMember(false));
        }, 200);

        return () => clearTimeout(timer);
    }, [memberQuery]);

    const clearMemberSearch = () => {
        setMemberQuery('');
        setMemberResults([]);
    };

    return {
        memberQuery,
        setMemberQuery,
        memberResults,
        setMemberResults,
        isSearchingMember,
        clearMemberSearch,
    };
}
