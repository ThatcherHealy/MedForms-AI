
import { Redirect } from "expo-router";
import { initializeRevenueCat } from '@/RevenueCatConfig';
import { useEffect } from "react";

const StartPage = () => {

    useEffect(() => {
        initializeRevenueCat();
      }, []);

    return <Redirect href={`./login`} />;
};

export default StartPage;