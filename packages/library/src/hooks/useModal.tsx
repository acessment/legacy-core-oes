import { useState } from "react";

const useModal = <T = Record<string, any>,>() => {
    const [isShowing, setIsShowing] = useState(false);
    const [data, setData] = useState<T>();

    // optional param for ts
    const toggle = (obj?: T) => {
        setIsShowing(!isShowing);
        setData(obj);
    };

    return [{ show: isShowing, data: data }, toggle] as const;
};

export default useModal;
