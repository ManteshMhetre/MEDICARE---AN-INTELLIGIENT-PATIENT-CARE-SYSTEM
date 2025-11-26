import { useEffect } from 'react';
 
const useDocTitle = (title) => {
    useEffect(() => {
        if (title) {
            document.title = `${title} - MediCare`;
        } else {
            document.title = 'MediCare';
        }
    }, [title]);

    return null;
};

export default useDocTitle;