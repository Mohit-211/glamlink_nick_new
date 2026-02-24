// Quick test to verify the transform function works with the user's data
const userPromotion = {
  id: "promo-1763896668994",
  title: "Promo 1",
  description: "My new promo",
  category: "special-offer",
  conditions: "no terms",
  tags: ["no terms", "Free"],
  discountPrice: 0,
  originalPrice: undefined,
  priceUnit: "flat",
  image: undefined,
  bookingUrl: undefined,
  detailsUrl: undefined,
  isExclusive: false,
  isLimitedTime: true,
  isSpecialOffer: false,
  rating: undefined,
  status: "expired",
  usageLimit: undefined,
  validFrom: undefined,
  validUntil: "2025-11-23"
};

// Simple transform function test (copied from our enhanced version)
const transformPromotionData = (promo) => {
  const id = promo.id || `promo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const calculateStatus = () => {
    if (promo.isActive === false) return "expired";
    if (!promo.validUntil) return "active";

    const now = new Date();
    const validDate = new Date(promo.validUntil);

    if (validDate < now) return "expired";
    return "active";
  };

  const status = promo.status || calculateStatus();

  let discountPrice;
  let originalPrice;
  let priceUnit = "flat";

  if (promo.value) {
    const valueStr = promo.value.toString().toLowerCase();
    if (valueStr === "free") {
      discountPrice = 0;
      originalPrice = 100;
    } else if (typeof promo.value === "string" && promo.value.includes("%")) {
      const percentMatch = promo.value.match(/(\d+)%/);
      if (percentMatch) {
        const discountPercent = parseInt(percentMatch[1]);
        originalPrice = promo.originalPrice || 200;
        discountPrice = originalPrice * (1 - discountPercent / 100);
      }
    } else if (typeof promo.value === "string" && promo.value.includes("$")) {
      const priceMatch = promo.value.match(/\$(\d+)/);
      if (priceMatch) {
        const priceValue = parseInt(priceMatch[1]);
        if (promo.value.toLowerCase().includes("save") || promo.value.toLowerCase().includes("off")) {
          discountPrice = priceValue;
          originalPrice = promo.originalPrice || (priceValue * 2);
        } else {
          discountPrice = priceValue;
          originalPrice = promo.originalPrice || (priceValue * 1.25);
        }
      }
    } else if (typeof promo.value === "number") {
      discountPrice = promo.value;
      originalPrice = promo.originalPrice || (promo.value * 1.25);
    }
  } else if (promo.discountPrice !== undefined) {
    discountPrice = promo.discountPrice;
    originalPrice = promo.originalPrice || (promo.discountPrice * 1.25);
  } else if (promo.originalPrice !== undefined) {
    originalPrice = promo.originalPrice;
    discountPrice = promo.discountPrice || (originalPrice * 0.8);
  }

  const generateBookingUrl = () => {
    if (promo.bookingUrl) return promo.bookingUrl;
    if (promo.link) return promo.link;
    return `https://glamlink.com/book?promo=${id}`;
  };

  const generateDetailsUrl = () => {
    if (promo.detailsUrl) return promo.detailsUrl;
    return `https://glamlink.com/promo/${id}`;
  };

  const generateImageUrl = () => {
    if (promo.image) return promo.image;
    return '/images/default-promo.jpg';
  };

  return {
    id,
    title: promo.title || "Special Offer",
    description: promo.description || "Special promotion available",
    originalPrice,
    discountPrice,
    priceUnit: promo.priceUnit || priceUnit,
    status,
    isSpecialOffer: promo.isFeatured || promo.isSpecialOffer || promo.type === 'special' || false,
    isLimitedTime: !!promo.validUntil || promo.type === 'limited-time',
    isExclusive: promo.isExclusive || promo.type === 'package' || false,
    validFrom: promo.validFrom || promo.startDate,
    validUntil: promo.validUntil || promo.endDate,
    bookingUrl: generateBookingUrl(),
    detailsUrl: generateDetailsUrl(),
    tags: Array.isArray(promo.tags) ? promo.tags.slice(0, 8) : [],
    category: promo.category || 'special-offer',
    conditions: promo.conditions || promo.terms || "Standard terms apply",
    usageLimit: promo.usageLimit || "One per customer",
    image: generateImageUrl(),
    rating: promo.rating || (promo.isFeatured ? 4.5 : 4.0)
  };
};

// Test the transformation
const result = transformPromotionData(userPromotion);

console.log("=== PROMOTION TRANSFORM TEST ===");
console.log("Input:", JSON.stringify(userPromotion, null, 2));
console.log("\nOutput:", JSON.stringify(result, null, 2));

// Check for undefined values
const undefinedFields = Object.entries(result).filter(([key, value]) => value === undefined);
console.log("\n=== UNDEFINED FIELDS ===");
console.log(`Found ${undefinedFields.length} undefined fields:`, undefinedFields.map(([key]) => key));

// Success criteria
const hasNoUndefined = undefinedFields.length === 0;
console.log(`\n=== RESULT ===`);
console.log(`✅ Transform function ${hasNoUndefined ? 'SUCCESS' : 'FAILED'} - ${undefinedFields.length} undefined fields remaining`);

if (hasNoUndefined) {
  console.log("🎉 All fields have proper values! Your Digital Business Card should now display promotions without undefined values.");
} else {
  console.log("⚠️  There are still undefined fields that need to be addressed.");
}