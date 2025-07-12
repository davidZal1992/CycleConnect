# Backend Search Implementation Guide

## Overview

This implementation replaces frontend filtering with a robust backend search system. Instead of loading all rides and filtering them on the frontend, the search is now performed on the backend with proper database querying and pagination.

## What Was Implemented

### 1. Backend Components

#### **RideSearchDTO.java**
- Handles search parameters from frontend
- Includes: searchQuery, distanceRange, location coordinates, and all filter options
- Maps frontend filter names to backend enum values

#### **RideController.java**
- Added `POST /api/v1/rides/search` endpoint
- Accepts RideSearchDTO in request body
- Returns paginated search results

#### **RideService.java & RideServiceImpl.java**  
- Added `searchRides()` method to interface and implementation
- Handles the business logic for search operations

#### **RideRepositoryCustom.java & RideRepositoryCustomImpl.java**
- Custom repository implementation with complex search logic
- Uses JPA Criteria API for dynamic query building
- Handles multiple filter combinations efficiently

### 2. Frontend Components

#### **utils/search-api.ts**
- TypeScript API client for search functionality
- Converts frontend filter state to backend search request
- Handles HTTP requests to search endpoint

#### **hooks/use-debounced-search.ts**
- Custom React hook for debounced search
- Prevents excessive API calls during typing
- Manages loading states and error handling

#### **examples/home-screen-with-search.tsx**
- Complete example of how to integrate the search API
- Replaces frontend filtering with backend search
- Shows proper usage of all components

## Search Features

### **Text Search**
- Searches in both ride title and location
- Case-insensitive matching
- Uses SQL LIKE with wildcards

### **Location-Based Search**
- Filters rides within specified distance range
- Uses bounding box approach for performance
- Requires user's latitude/longitude coordinates

### **Multi-Filter Support**
- **Bike Types**: analog, electric
- **Ride Types**: road, offroad, trails, urban
- **Difficulty Levels**: easy, medium, hard
- **Technical Levels**: none (mapped to easy), easy, medium, hard
- **Speed Levels**: slow, medium, medium-high (mapped to fast), fast

### **Frontend-Backend Mapping**
The system handles mismatches between frontend and backend enum values:
- Frontend "none" technical level → Backend "EASY"
- Frontend "medium-high" speed → Backend "FAST"
- All other values are mapped 1:1 (case-insensitive)

## Usage Example

### For your example: Search "בן שמן" with 45km distance, medium difficulty, analog bike

**Frontend Request:**
```javascript
const searchRequest = {
  searchQuery: "בן שמן",
  distanceRange: 45,
  latitude: 32.0853, // User's location
  longitude: 34.7818,
  difficultyLevels: ["medium"],
  bikeTypes: ["analog"],
  includeUpcomingOnly: true
};
```

**Backend Query:**
```sql
SELECT * FROM rides r 
WHERE (LOWER(r.title) LIKE '%בן שמן%' OR LOWER(r.location) LIKE '%בן שמן%')
AND r.latitude BETWEEN 31.68 AND 32.49
AND r.longitude BETWEEN 34.38 AND 35.18  
AND r.difficulty_level = 'MEDIUM'
AND r.bike_type = 'ANALOG'
AND r.ride_date_time >= NOW()
ORDER BY r.ride_date_time ASC
```

## Integration Steps

1. **Update your backend URL** in `utils/search-api.ts`
2. **Replace your existing home screen** with the search-enabled version
3. **Add user location detection** (optional, for distance filtering)
4. **Remove frontend filtering logic** from your existing components
5. **Test the search functionality** with various filter combinations

## Key Benefits

- **Performance**: Only relevant rides are fetched from database
- **Scalability**: Works efficiently with large datasets
- **Real-time**: Debounced search provides instant feedback
- **Flexible**: Easy to add new filter criteria
- **Maintainable**: Clean separation between frontend and backend logic

## API Endpoints

### Search Rides
```
POST /api/v1/rides/search?page=0&size=10
Content-Type: application/json

{
  "searchQuery": "בן שמן",
  "distanceRange": 45,
  "latitude": 32.0853,
  "longitude": 34.7818,
  "difficultyLevels": ["medium"],
  "bikeTypes": ["analog"]
}
```

### Response Format
```json
{
  "content": [...], // Array of ride objects
  "totalElements": 15,
  "totalPages": 2,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false
}
```

## Next Steps

1. Start your backend server
2. Test the search endpoint with Postman or similar tool
3. Update your frontend to use the new search functionality
4. Remove old frontend filtering code
5. Add proper error handling and loading states

Your search system is now ready to handle complex queries efficiently on the backend! 