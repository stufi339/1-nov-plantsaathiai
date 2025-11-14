import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, FileText, TrendingUp, Shield, Building2, Droplets, Leaf, MapPin, Star, Filter, Sprout, CreditCard, Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Scheme {
  name: string;
  launchPeriod: string;
  budget?: string;
  pension?: string;
  contribution?: string;
  target?: string;
  premiumRates?: string;
  limits?: string;
  interestRate?: string;
  subsidyStructure?: string;
  fundingPattern?: string;
  eligibility: string;
  benefits: string;
  howToApply: string;
  documentsRequired?: string;
  achievement?: string;
  exclusions?: string;
  objective?: string;
  coverage?: string;
  status?: string;
  components?: string;
  funding?: string;
  study?: string;
  impact?: string;
  implementation?: string;
  maturityPeriod?: string;
  investment?: string;
  tax?: string;

  // New intelligent fields
  category: string;
  icon: string;
  relevanceScore?: number;
  recommended?: boolean;
  stateSpecific?: string[];
  cropSpecific?: string[];
  color: string;
  priority: 'High' | 'Medium' | 'Low';
  newScheme?: boolean;
}

interface Category {
  title: string;
  schemes: Scheme[];
  icon?: string;
  color?: string;
}

// Enhanced scheme data with intelligence
const allSchemes: Scheme[] = [
  // Income Support
  {
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    launchPeriod: "2019, Expanded in 2025",
    budget: "₹6,000 per year per farmer",
    eligibility: "All farmers with cultivable land regardless of holding size. Small and marginal farmers prioritized. New in 2025: Tenant farmers and sharecroppers now included. Names must be in land records (cut-off date: February 1, 2019). e-KYC mandatory.\n\nExclusions: Institutional landholders, current/former constitutional post holders, government employees, income taxpayers, professionals (doctors, engineers, lawyers, CAs), pensioners with ₹10,000+/month pension.",
    benefits: "₹2,000 every 4 months via Direct Benefit Transfer (DBT). Biometric verification for accuracy. Over 10 crore beneficiaries in 19th installment (Feb 2025). Digital land record integration for faster processing.",
    howToApply: "Self-registration at pmkisan.gov.in. Visit nearest Common Service Centre (CSC). Automatic enrollment for eligible farmers during saturation drives.",
    documentsRequired: "Aadhaar card, bank account details, land ownership records, mobile number",

    category: "Income Support",
    icon: "TrendingUp",
    relevanceScore: 10,
    recommended: true,
    stateSpecific: ["Punjab", "Haryana", "Uttar Pradesh", "Bihar"],
    cropSpecific: [],
    color: "from-green-500 to-green-600",
    priority: "High"
  },
  {
    name: "PM Kisan Maandhan Yojana (PM-KMY)",
    launchPeriod: "September 2019",
    pension: "₹3,000 per month after 60 years",
    eligibility: "Small and marginal farmers (up to 2 hectares). Entry age: 18-40 years.\n\nNot covered under NPS, ESIC, EPF. Not a beneficiary of PM-LVM or PM-SYM. Not income taxpayer.\n\nExclusions: Institutional landholders, government employees (current/retired), constitutional post holders.",
    contribution: "Monthly: ₹55 to ₹200 based on entry age. Government provides matching contribution. Younger entry = lower monthly contribution.",
    benefits: "Minimum guaranteed pension of ₹3,000/month at 60. Spouse eligible for 50% pension (₹1,500) after subscriber's death. LIC manages pension fund. Voluntary and contributory.\n\nExit Options: Before 60 (less than 5 years): Own contribution + savings bank interest. After 5 years: Own contribution + PMKMY interest rate.",
    howToApply: "Visit nearest Common Service Centre (CSC). Self-registration on maandhan.in. VLE (Village Level Entrepreneur) assists with enrollment.",
    documentsRequired: "Valid Aadhaar card, savings bank account/passbook, land records",

    category: "Income Support",
    icon: "Users",
    relevanceScore: 8,
    recommended: true,
    stateSpecific: [],
    cropSpecific: [],
    color: "from-blue-500 to-blue-600",
    priority: "Medium"
  },

  // Crop Insurance & Credit
  {
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    launchPeriod: "2016, Ongoing 2025",
    premiumRates: "Kharif crops: 2% of sum insured. Rabi crops: 1.5% of sum insured. Horticultural/commercial crops: 5% of sum insured.",
    eligibility: "All farmers (loanee and non-loanee) growing notified crops in notified areas. Sharecroppers and tenant farmers eligible. Voluntary for all farmers.",
    benefits: "Comprehensive coverage against drought, flood, cyclone, hailstorm, pests, diseases. Post-harvest losses covered (up to 14 days for specific crops). Technology-based assessment using drones, GPS, remote sensing. Direct claim settlement to bank accounts. Government subsidizes remaining premium. Deadline: 31st July for Kharif 2025.",
    howToApply: "Online: pmfby.gov.in. Through banks (automatic for loan farmers). Common Service Centres.\n\nClaim Process: Report within 72 hours of damage; joint survey; settlement within 2 months.",
    documentsRequired: "Aadhaar card, bank account, land records/lease agreement, crop sowing certificate",

    category: "Insurance & Credit",
    icon: "Shield",
    relevanceScore: 9,
    recommended: true,
    stateSpecific: ["Punjab", "Haryana"],
    cropSpecific: ["Rice", "Wheat", "Maize"],
    color: "from-red-500 to-red-600",
    priority: "High"
  },
  {
    name: "Kisan Credit Card (KCC) Scheme",
    launchPeriod: "1998, Updated 2025 with increased limits",
    limits: "Up to ₹5 lakh (increased from ₹3 lakh in Budget 2025)",
    interestRate: "4% per annum (with 3% interest subvention)",
    eligibility: "All farmers with individual or joint land ownership. Tenant farmers, sharecroppers, oral lessees. Animal husbandry and fisheries workers (without land). Age: 18-75 years (co-borrower required if above 60).",
    benefits: "Collateral-free loans up to ₹1.6 lakh. Flexible repayment after harvest (within 12 months). Crop insurance and personal accident coverage included. ATM-enabled withdrawals. Over 5.9 crore farmers benefiting (Dec 2024).",
    howToApply: "Visit bank branch or apply online through bank website. Digital KCC platform for real-time verification. PM-KISAN registered farmers can get auto-enrollment.",
    documentsRequired: "Aadhaar card, land records, bank passbook/statement, passport photos",

    category: "Insurance & Credit",
    icon: "CreditCard",
    relevanceScore: 9,
    recommended: true,
    stateSpecific: ["Punjab"],
    cropSpecific: [],
    color: "from-purple-500 to-purple-600",
    priority: "High"
  },

  // Major Initiatives
  {
    name: "PM Dhan Dhaanya Krishi Yojana (PMDDKY)",
    launchPeriod: "October 2025",
    budget: "₹24,000 crore annually for 6 years (2025-26 to 2030-31)",
    target: "100 aspirational agriculture districts across 29 states/UTs",
    eligibility: "Farmers and agri-entrepreneurs in 100 selected districts; actively engaged in agriculture",
    benefits: "Enhanced agricultural productivity and crop diversification. Post-harvest storage at panchayat/block levels. Improved irrigation facilities. Better credit access (long-term and short-term). Convergence of 36 schemes from 11 departments. Monthly monitoring via 117 KPIs on digital dashboard.",
    howToApply: "District Dhan-Dhaanya Samitis prepare district-specific plans; supervised by National Committee coordinated by NITI Aayog",
    documentsRequired: "Aadhaar, bank account, land documents, residency proof in selected district",

    category: "Major Initiatives",
    icon: "Sprout",
    relevanceScore: 7,
    recommended: false,
    stateSpecific: ["Uttar Pradesh", "Maharashtra", "Madhya Pradesh", "Rajasthan", "Bihar"],
    cropSpecific: [],
    color: "from-orange-500 to-orange-600",
    priority: "Medium",
    newScheme: true
  },
  {
    name: "National Mission on Natural Farming (NMNF)",
    launchPeriod: "Approved November 2024, Launched August 2025",
    budget: "₹2,481 crore (Centre: ₹1,584 crore, States: ₹897 crore)",
    target: "7.5 lakh hectares in 15,000 clusters; 1 crore farmers awareness",
    eligibility: "All farmers willing to adopt natural farming practices; focus on cluster approach (50 hectares, ~125 farmers per cluster)",
    benefits: "₹4,000 per acre per year for 2 years (up to 1 acre per farmer). Financial assistance covers training, livestock upkeep, bio-input preparation. 10,000 Bio-Input Resource Centres (BRCs) planned. Over 10 lakh farmers enrolled by July 2025. 70,021 Krishi Sakhis trained. 7,934 BRCs identified, 2,045 operational. Certification under Participatory Guarantee System (PGS)-India.",
    howToApply: "Online portal, through KVKs, Agricultural Universities, State agriculture departments, CRPs",
    documentsRequired: "Aadhaar, land records, bank account, willingness declaration",

    category: "Major Initiatives",
    icon: "Leaf",
    relevanceScore: 6,
    recommended: false,
    stateSpecific: [],
    cropSpecific: [],
    color: "from-green-600 to-green-700",
    priority: "Low",
    newScheme: true
  },

  // Infrastructure & Market Access
  {
    name: "e-NAM (National Agriculture Market)",
    launchPeriod: "April 2016",
    budget: "₹30 lakh per mandi (one-time assistance)",
    coverage: "1,389 mandis from 23 states and 4 UTs; 1.77 crore farmers and 2.53 lakh traders registered (Feb 2024)",
    eligibility: "All farmers, traders, buyers, processors, exporters. FPOs and cooperatives. States must implement 3 APMC Act reforms: e-auction permitted, single trading license, single-point levy.",
    benefits: "Transparent online trading with real-time price discovery. Better price realization for farmers. Access to wider markets across states. Reduced intermediaries and transaction costs. Quality assurance through testing labs. Direct payments to farmers. FPO trading module for collection centres. Warehouse-based trading via e-NWR. Platform of Platforms (POP) for inter-state trading.",
    howToApply: "Visit nearest e-NAM enabled APMC mandi. Register with Aadhaar, bank details, land/farm ownership proof. Access portal: enam.gov.in. Mobile app available in 11 languages.",
    documentsRequired: "Aadhaar card, bank account details, land ownership/cultivation proof",

    category: "Infrastructure",
    icon: "Building2",
    relevanceScore: 8,
    recommended: true,
    stateSpecific: ["Punjab"],
    cropSpecific: [],
    color: "from-cyan-500 to-cyan-600",
    priority: "Medium"
  },

  // Irrigation & Mechanization (most relevant for Punjab)
  {
    name: "PM Krishi Sinchai Yojana (PMKSY)",
    launchPeriod: "2015",
    budget: "₹8,259.85 crore for 2025-26",
    components: "Accelerated Irrigation Benefit Programme (AIBP), Har Khet Ko Pani (HKKP), Per Drop More Crop (PDMC) - Micro-irrigation focus, Watershed Development",
    achievement: "56 new watershed projects sanctioned (₹700 crore, covering 280,000 hectares across 10 states) in Jan 2025",
    eligibility: "All farmers with land holdings. Members of SHGs, trusts, cooperative societies, FPGs. Tenant farmers with lease agreements.",
    benefits: "Subsidies for drip and sprinkler irrigation: 55% for small/marginal farmers, 45% for others. Water source creation and restoration. Rainwater harvesting structures. 'Per Drop More Crop' water efficiency focus. Improved irrigation access in rainfed areas.",
    fundingPattern: "75:25 (Centre:State); 90:10 for NE/hilly states; 100% for UTs",
    howToApply: "Visit local agriculture office; State agriculture departments; District offices for proposals",
    documentsRequired: "Aadhaar card, address proof, land documents, domicile certificate",

    category: "Irrigation",
    icon: "Droplets",
    relevanceScore: 9,
    recommended: true,
    stateSpecific: ["Punjab", "Haryana"],
    cropSpecific: [],
    color: "from-blue-600 to-blue-700",
    priority: "High"
  },

  // Soil Health (highly relevant)
  {
    name: "Soil Health Card Scheme",
    launchPeriod: "February 2015",
    budget: "₹1,706.18 crore disbursed to states/UTs",
    achievement: "24.17 crore (241.7 million) cards issued free to farmers (Sep 2024); 25+ crore by July 2025",
    eligibility: "All farmers engaged in agriculture; provided free of cost",
    benefits: "Detailed soil analysis of 12 parameters: N, P, K, S (macro); Zn, Cu, Fe, Mn, B (micro); pH, EC, OC. Crop-specific fertilizer recommendations for up to 6 crops. Issued every 2 years. Geo-tagged soil sampling with GIS integration.",
    study: "Studies show 24% higher income for adopters, 90%+ farmers report increased yields. Reduces input costs, improves soil fertility.",
    howToApply: "Automatic process - Department of Agriculture collects soil samples. No application needed from farmers. Access cards online at soilhealth.dac.gov.in.",
    documentsRequired: "Land records for sample collection; Aadhaar for portal access",

    category: "Soil Health",
    icon: "Leaf",
    relevanceScore: 10,
    recommended: true,
    stateSpecific: [],
    cropSpecific: [],
    color: "from-amber-500 to-amber-600",
    priority: "High"
  }
];

// User context helper
const useUserContext = () => {
  const [userData, setUserData] = useState({
    location: "Punjab, India",
    crops: [] as string[],
    state: "Punjab"
  });

  useEffect(() => {
    // Load user fields from Supabase to determine crops and location
    const loadFields = async () => {
      try {
        const { supabaseFieldService } = await import('@/lib/supabaseFieldService');
        const fields = await supabaseFieldService.getFields();
        const crops = [...new Set(fields.map((field: any) => field.crop_type).filter(Boolean))] as string[];

        setUserData(prev => ({
          ...prev,
          crops
        }));
      } catch (error) {
        console.error('Failed to load fields:', error);
      }
    };
    
    loadFields();
  }, []);

  return userData;
};

export const SchememesView = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recommended");
  
  // 🔥 LOG PAGE VIEW
  useEffect(() => {
    import('@/lib/blackBoxService').then(({ blackBoxService }) => {
      blackBoxService.logUserInteraction('page_view', 'schemes_view', undefined, {
        timestamp: new Date().toISOString()
      });
    });
  }, []);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const { location, crops, state } = useUserContext();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/soilsati'); // Default fallback to main screen
    }
  };

  // Intelligent recommendation logic
  const getRecommendedSchemes = () => {
    return allSchemes
      .filter(scheme => {
        // Location relevance
        if (scheme.stateSpecific && scheme.stateSpecific.length > 0) {
          if (!scheme.stateSpecific.some(s => s === state)) return false;
        }

        // Crop relevance
        if (scheme.cropSpecific && scheme.cropSpecific.length > 0) {
          if (!scheme.cropSpecific.some(c => crops.includes(c))) return false;
        }

        return true;
      })
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, 6); // Top 6 recommendations
  };

  const getSchemesByCategory = (category: string) => {
    if (category === "all") return allSchemes;
    return allSchemes.filter(scheme => scheme.category === category);
  };

  useEffect(() => {
    if (activeTab === "recommended") {
      setFilteredSchemes(getRecommendedSchemes());
    } else {
      setFilteredSchemes(getSchemesByCategory(activeTab));
    }
  }, [activeTab, crops, state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-blue-50 dark:from-green-950 dark:via-yellow-950 dark:to-blue-950">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 bg-gradient-primary text-white relative">
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 justify-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Government Schemes</h1>
            <p className="text-green-100">Personalized for your farm in {state}</p>
          </div>
        </div>

        {/* User Context Summary */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-green-100 mb-2">
            <MapPin className="w-4 h-4" />
            {location} • {crops.length > 0 ? `${crops.join(', ')} farming` : 'General farming'}
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-300" />
            <span className="text-sm text-white">Schemes personalized based on your location and crops</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-6 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="recommended" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">For You</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">All</span>
            </TabsTrigger>
            <TabsTrigger value="Income Support" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Income</span>
            </TabsTrigger>
            <TabsTrigger value="Insurance & Credit" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Credit</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid gap-4">
              {filteredSchemes.map((scheme) => (
                <SchemeCard key={scheme.name} scheme={scheme} userState={state} userCrops={crops} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface SchemeCardProps {
  scheme: Scheme;
  userState: string;
  userCrops: string[];
}

const SchemeCard = ({ scheme, userState, userCrops }: SchemeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine relevance badges
  const isLocationMatch = !scheme.stateSpecific || scheme.stateSpecific.length === 0 || scheme.stateSpecific.includes(userState);
  const isCropMatch = !scheme.cropSpecific || scheme.cropSpecific.length === 0 || scheme.cropSpecific.some(crop => userCrops.includes(crop));

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
      {/* Header with gradient */}
      <CardHeader className={`pb-3 text-white relative bg-gradient-to-r ${scheme.color}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {scheme.icon === "TrendingUp" && <TrendingUp className="w-5 h-5" />}
              {scheme.icon === "Shield" && <Shield className="w-5 h-5" />}
              {scheme.icon === "CreditCard" && <CreditCard className="w-5 h-5" />}
              {scheme.icon === "Sprout" && <Sprout className="w-5 h-5" />}
              {scheme.icon === "Building2" && <Building2 className="w-5 h-5" />}
              {scheme.icon === "Droplets" && <Droplets className="w-5 h-5" />}
              {scheme.icon === "Leaf" && <Leaf className="w-5 h-5" />}
              {scheme.icon === "Users" && <Users className="w-5 h-5" />}

              {scheme.newScheme && (
                <Badge className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5">
                  NEW
                </Badge>
              )}
            </div>

            <CardTitle className="text-lg leading-tight">{scheme.name}</CardTitle>
          </div>

          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {scheme.priority}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm opacity-90">
          <span>{scheme.launchPeriod}</span>
          {scheme.budget && <span>•</span>}
          {scheme.budget && <span>{scheme.budget}</span>}
        </div>

        {/* Relevance indicators */}
        <div className="flex gap-1 mt-2">
          {isLocationMatch && (
            <Badge variant="secondary" className="bg-white/20 text-white text-xs">
              📍 Local
            </Badge>
          )}
          {isCropMatch && userCrops.length > 0 && (
            <Badge variant="secondary" className="bg-white/20 text-white text-xs">
              🌾 Crop Match
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-3">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between">
              <span>View Details</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4 space-y-3">
            {scheme.budget && scheme.budget !== (scheme as any).pension && (
              <div>
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Budget/Structure
                </h4>
                <p className="text-sm text-muted-foreground">{scheme.budget}</p>
              </div>
            )}

            {scheme.eligibility && (
              <div>
                <h4 className="font-semibold text-sm mb-1">✨ Eligibility</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{scheme.eligibility}</p>
              </div>
            )}

            {scheme.benefits && (
              <div>
                <h4 className="font-semibold text-sm mb-1">🎯 Benefits</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{scheme.benefits}</p>
              </div>
            )}

            {scheme.howToApply && (
              <div>
                <h4 className="font-semibold text-sm mb-1">📋 How to Apply</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{scheme.howToApply}</p>
              </div>
            )}

            {scheme.documentsRequired && (
              <div>
                <h4 className="font-semibold text-sm mb-1">📄 Documents Required</h4>
                <p className="text-sm text-muted-foreground">{scheme.documentsRequired}</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
