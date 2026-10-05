import Cta from "../components/marketing/sections/Cta";
import Examples from "../components/marketing/sections/Examples";
import Faq from "../components/marketing/sections/Faq";
import Features from "../components/marketing/sections/Features";
import Hero from "../components/marketing/sections/Hero";
import { HowItWorks } from "../components/marketing/sections/HowItWorks";
import PoweredBy from "../components/marketing/sections/PoweredBy";
import Stats from "../components/marketing/sections/Stats";
import UseCases from "../components/marketing/sections/UseCases";


export default function HomePage() {
    return (
        <>
            <Hero />
            <PoweredBy />
            <Features />
            <HowItWorks />
            <Examples />
            <Stats />
            <UseCases />
            <Faq />
            <Cta />
        </>
    );
}