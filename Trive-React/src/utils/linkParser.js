/**
 * Trive Institutional Link Parser Engine
 * Extracts company metadata and patterns out of application links
 */
export const parseInternshipLink = (urlStr) => {
    if (!urlStr) return null;
    
    const cleanUrl = urlStr.trim();
    let companyName = "Unknown Corporation";
    let roleTitle = "Extracting Architecture...";
    let sourcePlatform = "External Web Node";
    let tags = ["Link Asset"];

    try {
        const urlObj = new URL(cleanUrl);
        const hostname = urlObj.hostname.toLowerCase();

        // 1. Lever.co Pipeline Detection
        if (hostname.includes('lever.co')) {
            sourcePlatform = "Lever ATS";
            const paths = urlObj.pathname.split('/').filter(p => p);
            if (paths.length > 0) {
                companyName = paths[0].toUpperCase();
                tags = ["Lever", "Direct Track"];
            }
        } 
        // 2. Greenhouse.io Pipeline Detection
        else if (hostname.includes('greenhouse.io')) {
            sourcePlatform = "Greenhouse ATS";
            // Check both boards/company or fallback query parameters
            const paths = urlObj.pathname.split('/').filter(p => p);
            const companyIndex = paths.indexOf('boards');
            if (companyIndex !== -1 && paths[companyIndex + 1]) {
                companyName = paths[companyIndex + 1].toUpperCase();
            } else if (urlObj.searchParams.get('for')) {
                companyName = urlObj.searchParams.get('for').toUpperCase();
            }
            tags = ["Greenhouse", "API Pipeline"];
        } 
        // 3. LinkedIn Pipeline Detection
        else if (hostname.includes('linkedin.com')) {
            sourcePlatform = "LinkedIn Jobs";
            companyName = "Linked Account Target";
            tags = ["LinkedIn", "External Sourced"];
        }
        // 4. General Native Corporate Board Fallback (e.g. apple.com/jobs)
        else {
            const domainParts = hostname.replace('www.', '').split('.');
            // Capitalize primary domain handle (e.g. "apple" from apple.com)
            const primaryHandle = domainParts[0];
            companyName = primaryHandle.charAt(0).toUpperCase() + primaryHandle.slice(1);
            sourcePlatform = "Native ATS Portal";
            tags = ["Direct Board"];
        }

        return {
            company: companyName,
            role: roleTitle,
            platform: sourcePlatform,
            tags: [...tags, "Pending System Audit"],
            cleanedUrl: cleanUrl
        };

    } catch (err) {
        console.error("Parser Engine string exception:", err);
        return null;
    }
};