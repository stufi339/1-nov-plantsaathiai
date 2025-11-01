// Demo content seeder for testing the new dashboard features
// Run this in browser console: import('./lib/demoContentSeeder').then(m => m.seedDemoContent())

export const seedDemoContent = () => {
  // Educational Videos
  const demoVideos = [
    {
      id: "1",
      title: "Modern Rice Farming Techniques",
      titleHi: "आधुनिक धान की खेती की तकनीक",
      titleBn: "আধুনিক ধান চাষের কৌশল",
      description: "Learn the latest methods for increasing rice yield",
      descriptionHi: "धान की उपज बढ़ाने के नवीनतम तरीके जानें",
      descriptionBn: "ধানের ফলন বৃদ্ধির সর্বশেষ পদ্ধতি শিখুন",
      youtubeId: "dQw4w9WgXcQ",
      duration: "12:30",
      category: "rice-farming",
      views: 1250,
      addedAt: new Date().toISOString()
    },
    {
      id: "2",
      title: "Organic Pest Control Methods",
      titleHi: "जैविक कीट नियंत्रण विधियां",
      titleBn: "জৈব কীটপতঙ্গ নিয়ন্ত্রণ পদ্ধতি",
      description: "Natural ways to protect your crops from pests",
      descriptionHi: "कीटों से फसलों की रक्षा के प्राकृতिक तरीके",
      descriptionBn: "কীটপতঙ্গ থেকে ফসল রক্ষার প্রাকৃতিক উপায়",
      youtubeId: "dQw4w9WgXcQ",
      duration: "8:45",
      category: "pest-control",
      views: 890,
      addedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "3",
      title: "Smart Irrigation Techniques",
      titleHi: "स्मार्ट सिंचाई तकनीक",
      titleBn: "স্মার্ট সেচ কৌশল",
      description: "Save water and increase efficiency with smart irrigation",
      descriptionHi: "स्मार्ट सिंचाई से पानी बचाएं और दक्षता बढ़ाएं",
      descriptionBn: "স্মার্ট সেচ দিয়ে জল সাশ্রয় করুন এবং দক্ষতা বৃদ্ধি করুন",
      youtubeId: "dQw4w9WgXcQ",
      duration: "15:20",
      category: "irrigation",
      views: 2100,
      addedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  // Success Stories
  const demoStories = [
    {
      id: "1",
      farmerName: "Ramesh Kumar",
      location: "Punjab, India",
      achievement: "Increased rice yield by 40% using satellite monitoring and smart irrigation",
      achievementHi: "उपग्रह निगरानी और स्मार्ट सिंचाई का उपयोग करके धान की उपज में 40% की वृद्धि",
      achievementBn: "স্যাটেলাইট মনিটরিং এবং স্মার্ট সেচ ব্যবহার করে ধানের ফলন 40% বৃদ্ধি",
      imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
      yieldIncrease: 40,
      cropType: "Rice",
      addedAt: new Date().toISOString()
    },
    {
      id: "2",
      farmerName: "Sunita Devi",
      location: "Haryana, India",
      achievement: "Reduced water usage by 30% while maintaining crop health using Jal Saathi",
      achievementHi: "जल साथी का उपयोग करके फसल स्वास्थ्य बनाए रखते हुए पानी के उपयोग में 30% की कमी",
      achievementBn: "জল সাথী ব্যবহার করে ফসলের স্বাস্থ্য বজায় রেখে জলের ব্যবহার 30% হ্রাস",
      imageUrl: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=800",
      yieldIncrease: 25,
      cropType: "Wheat",
      addedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "3",
      farmerName: "Vijay Singh",
      location: "Uttar Pradesh, India",
      achievement: "Early disease detection saved entire crop, preventing ₹2 lakh loss",
      achievementHi: "शीघ्र रोग पहचान ने पूरी फसल बचाई, ₹2 लाख के नुकसान को रोका",
      achievementBn: "প্রাথমিক রোগ সনাক্তকরণ সম্পূর্ণ ফসল বাঁচিয়েছে, ₹2 লক্ষ ক্ষতি প্রতিরোধ করেছে",
      imageUrl: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
      yieldIncrease: 35,
      cropType: "Sugarcane",
      addedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  // Community Gallery
  const demoGallery = [
    {
      id: "1",
      imageUrl: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
      caption: "Golden harvest season in Punjab! 🌾",
      captionHi: "पंजाब में सुनहरी फसल का मौसम! 🌾",
      captionBn: "পাঞ্জাবে সোনালী ফসল কাটার মৌসুম! 🌾",
      category: "harvest",
      likes: 245,
      comments: 18,
      location: "Punjab",
      addedAt: new Date().toISOString()
    },
    {
      id: "2",
      imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
      caption: "Healthy rice fields after using Plant Saathi recommendations",
      captionHi: "प्लांट साथी की सिफारिशों का उपयोग करने के बाद स्वस्थ धान के खेत",
      captionBn: "প্ল্যান্ট সাথী সুপারিশ ব্যবহারের পরে স্বাস্থ্যকর ধান ক্ষেত",
      category: "farming",
      likes: 189,
      comments: 12,
      location: "Haryana",
      addedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "3",
      imageUrl: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=800",
      caption: "Smart irrigation system in action 💧",
      captionHi: "स्मार्ट सिंचाई प्रणाली कार्य में 💧",
      captionBn: "স্মার্ট সেচ ব্যবস্থা কাজ করছে 💧",
      category: "irrigation",
      likes: 312,
      comments: 24,
      location: "Maharashtra",
      addedAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: "4",
      imageUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800",
      caption: "Organic farming success! 🌱",
      captionHi: "जैविक खेती की सफलता! 🌱",
      captionBn: "জৈব চাষের সাফল্য! 🌱",
      category: "organic",
      likes: 156,
      comments: 9,
      location: "Kerala",
      addedAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: "5",
      imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
      caption: "Beautiful sunset over the fields 🌅",
      captionHi: "खेतों पर सुंदर सूर्यास्त 🌅",
      captionBn: "মাঠের উপর সুন্দর সূর্যাস্ত 🌅",
      category: "nature",
      likes: 428,
      comments: 31,
      location: "Rajasthan",
      addedAt: new Date(Date.now() - 345600000).toISOString()
    },
    {
      id: "6",
      imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800",
      caption: "Fresh vegetables from our farm 🥬",
      captionHi: "हमारे खेत से ताजी सब्जियां 🥬",
      captionBn: "আমাদের খামার থেকে তাজা সবজি 🥬",
      category: "vegetables",
      likes: 203,
      comments: 15,
      location: "Gujarat",
      addedAt: new Date(Date.now() - 432000000).toISOString()
    }
  ];

  // Save to localStorage
  localStorage.setItem('educational_videos', JSON.stringify(demoVideos));
  localStorage.setItem('farmer_stories', JSON.stringify(demoStories));
  localStorage.setItem('community_gallery', JSON.stringify(demoGallery));

  console.log('✅ Demo content seeded successfully!');
  console.log('📹 Videos:', demoVideos.length);
  console.log('🏆 Stories:', demoStories.length);
  console.log('🖼️ Gallery posts:', demoGallery.length);
  
  return {
    videos: demoVideos.length,
    stories: demoStories.length,
    gallery: demoGallery.length
  };
};

// Auto-seed on import if in development
if (import.meta.env.DEV) {
  console.log('💡 Run seedDemoContent() to populate demo content');
}
