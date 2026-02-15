import type {
  Place,
  PreferenceAnalysis,
  Insights,
} from './types.js';

export class PreferenceAnalyzer {
  private places: Place[];

  constructor(places: Place[]) {
    this.places = places;
  }

  analyze(): PreferenceAnalysis {
    const categoryMap = new Map<string, { count: number; totalRating: number }>();
    const locationMap = new Map<string, { count: number; totalRating: number }>();
    const ratingDistribution: { [key: number]: number } = {};
    const sentimentDistribution = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    const visitsByTime: { [key: string]: number } = {};
    const visitsByDay: { [key: string]: number } = {};
    const seasonalVisits: { [key: string]: number } = {};

    for (const place of this.places) {
      // Category analysis
      if (place.category) {
        const existing = categoryMap.get(place.category) || {
          count: 0,
          totalRating: 0,
        };
        existing.count++;
        existing.totalRating += place.userRating || place.rating || 0;
        categoryMap.set(place.category, existing);
      }

      // Location analysis (simplified - using city/region from address)
      const location = this.extractLocation(place.address);
      if (location) {
        const existing = locationMap.get(location) || {
          count: 0,
          totalRating: 0,
        };
        existing.count++;
        existing.totalRating += place.userRating || place.rating || 0;
        locationMap.set(location, existing);
      }

      // Rating distribution
      const rating = Math.round(place.userRating || place.rating || 0);
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;

      // Sentiment distribution
      if (place.sentiment) {
        sentimentDistribution[place.sentiment]++;
      }

      // Time patterns (if lastVisited is available)
      if (place.lastVisited) {
        const date = new Date(place.lastVisited);
        const hour = date.getHours();
        const timeOfDay =
          hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
        visitsByTime[timeOfDay] = (visitsByTime[timeOfDay] || 0) + 1;

        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        visitsByDay[dayOfWeek] = (visitsByDay[dayOfWeek] || 0) + 1;

        const month = date.getMonth();
        const season =
          month < 3
            ? 'winter'
            : month < 6
            ? 'spring'
            : month < 9
            ? 'summer'
            : 'fall';
        seasonalVisits[season] = (seasonalVisits[season] || 0) + 1;
      }
    }

    // Calculate top categories
    const topCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        avgRating: data.totalRating / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate top locations
    const topLocations = Array.from(locationMap.entries())
      .map(([location, data]) => ({
        location,
        count: data.count,
        avgRating: data.totalRating / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Find favorite time of day
    const favoriteTimeOfDay = Object.entries(visitsByTime).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    // Find favorite day of week
    const favoriteDayOfWeek = Object.entries(visitsByDay).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    // Seasonal preferences
    const seasonalPreferences = Object.entries(seasonalVisits).map(
      ([season, count]) => ({ season, count })
    );

    // Recent favorites (places visited in last 30 days with high ratings)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentFavorites = this.places
      .filter((p) => {
        if (!p.lastVisited) return false;
        const visitDate = new Date(p.lastVisited);
        return visitDate >= thirtyDaysAgo;
      })
      .filter((p) => (p.userRating || p.rating || 0) >= 4)
      .sort((a, b) => {
        const aDate = a.lastVisited ? new Date(a.lastVisited).getTime() : 0;
        const bDate = b.lastVisited ? new Date(b.lastVisited).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 5);

    // Emerging categories (categories with recent activity)
    const recentCategories = new Set(
      recentFavorites.map((p) => p.category).filter(Boolean) as string[]
    );
    const emergingCategories = Array.from(recentCategories);

    // Declining interest (places not visited recently but were visited before)
    const decliningInterest = this.places
      .filter((p) => {
        if (!p.lastVisited || !p.visitCount) return false;
        const visitDate = new Date(p.lastVisited);
        return visitDate < thirtyDaysAgo && p.visitCount > 1;
      })
      .sort((a, b) => {
        const aDate = a.lastVisited ? new Date(a.lastVisited).getTime() : 0;
        const bDate = b.lastVisited ? new Date(b.lastVisited).getTime() : 0;
        return aDate - bDate;
      })
      .slice(0, 5);

    return {
      topCategories,
      topLocations,
      ratingDistribution,
      sentimentDistribution,
      patterns: {
        favoriteTimeOfDay,
        favoriteDayOfWeek,
        seasonalPreferences,
      },
      trends: {
        recentFavorites,
        emergingCategories,
        decliningInterest,
      },
    };
  }

  getInsights(): Insights {
    const analysis = this.analyze();
    const totalPlaces = this.places.length;
    const totalVisits = this.places.reduce(
      (sum, p) => sum + (p.visitCount || 0),
      0
    );
    const totalRating = this.places.reduce(
      (sum, p) => sum + (p.userRating || p.rating || 0),
      0
    );
    const averageRating = totalPlaces > 0 ? totalRating / totalPlaces : 0;

    // Favorite places (high rating, high visit count)
    const favoritePlaces = [...this.places]
      .filter((p) => (p.userRating || p.rating || 0) >= 4)
      .sort((a, b) => {
        const aScore =
          (a.userRating || a.rating || 0) * (a.visitCount || 0);
        const bScore =
          (b.userRating || b.rating || 0) * (b.visitCount || 0);
        return bScore - aScore;
      })
      .slice(0, 10);

    // Recent discoveries (places visited once recently)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentDiscoveries = this.places
      .filter(
        (p) =>
          p.lastVisited &&
          new Date(p.lastVisited) >= thirtyDaysAgo &&
          (p.visitCount || 0) === 1
      )
      .sort((a, b) => {
        const aDate = a.lastVisited ? new Date(a.lastVisited).getTime() : 0;
        const bDate = b.lastVisited ? new Date(b.lastVisited).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 5);

    // Most visited category
    const mostVisitedCategory =
      analysis.topCategories[0]?.category || 'Unknown';

    // Trending locations
    const trendingLocations = analysis.topLocations
      .slice(0, 3)
      .map((l) => l.location);

    // Rating trend (simplified - comparing recent vs older ratings)
    const recentPlaces = this.places.filter((p) => {
      if (!p.lastVisited) return false;
      return new Date(p.lastVisited) >= thirtyDaysAgo;
    });
    const recentAvgRating =
      recentPlaces.length > 0
        ? recentPlaces.reduce(
            (sum, p) => sum + (p.userRating || p.rating || 0),
            0
          ) / recentPlaces.length
        : 0;
    const olderPlaces = this.places.filter((p) => {
      if (!p.lastVisited) return false;
      return new Date(p.lastVisited) < thirtyDaysAgo;
    });
    const olderAvgRating =
      olderPlaces.length > 0
        ? olderPlaces.reduce(
            (sum, p) => sum + (p.userRating || p.rating || 0),
            0
          ) / olderPlaces.length
        : 0;

    let ratingTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAvgRating > olderAvgRating + 0.2) {
      ratingTrend = 'improving';
    } else if (recentAvgRating < olderAvgRating - 0.2) {
      ratingTrend = 'declining';
    }

    // Visit frequency pattern
    const avgVisitsPerPlace = totalPlaces > 0 ? totalVisits / totalPlaces : 0;
    let visitFrequency = 'low';
    if (avgVisitsPerPlace > 3) {
      visitFrequency = 'high';
    } else if (avgVisitsPerPlace > 1.5) {
      visitFrequency = 'medium';
    }

    // Preferred price range (simplified - would need price data)
    const preferredPriceRange = 'moderate'; // Placeholder

    // Time preferences
    const timePreferences = analysis.patterns.favoriteTimeOfDay
      ? `Prefers ${analysis.patterns.favoriteTimeOfDay} visits`
      : 'No clear time preference';

    return {
      totalPlaces,
      totalVisits,
      averageRating: Math.round(averageRating * 10) / 10,
      favoritePlaces,
      recentDiscoveries,
      trends: {
        mostVisitedCategory,
        trendingLocations,
        ratingTrend,
      },
      patterns: {
        visitFrequency,
        preferredPriceRange,
        timePreferences,
      },
      recommendations: [], // Will be populated by recommendation engine
    };
  }

  private extractLocation(address: string): string | null {
    // Simple extraction - in production, use a proper geocoding service
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    return null;
  }
}
