# Firestore Index Configuration

Firebase Firestore requires composite indexes for compound queries. Based on the errors, we need to create these indexes:

## Required Indexes

### 1. Habits Collection
- Collection: `habits`
- Fields: `userId` (Ascending), `createdAt` (Descending)

### 2. Notes Collection  
- Collection: `notes`
- Fields: `userId` (Ascending), `createdAt` (Descending)

### 3. Calendar Events Collection
- Collection: `calendarEvents`  
- Fields: `userId` (Ascending), `date` (Ascending)

### 4. Training Programs Collection
- Collection: `trainingPrograms`
- Fields: `userId` (Ascending), `createdAt` (Descending)

### 5. Workout Sessions Collection
- Collection: `workoutSessions`
- Fields: `userId` (Ascending), `createdAt` (Descending)

## How to Create Indexes

1. **Automatic Creation (Recommended)**:
   - Click on the URLs provided in the Firebase error messages
   - Firebase will automatically create the required indexes

2. **Manual Creation**:
   - Go to: https://console.firebase.google.com/project/routine-schemer/firestore/indexes
   - Click "Create Index"
   - Add the collection name and field combinations listed above

3. **Using Firebase CLI** (Optional):
   ```bash
   firebase firestore:indexes
   ```

## Index Status
Once created, indexes may take a few minutes to build. Check the status in the Firebase Console under Firestore > Indexes.

## Error URLs (Click to auto-create):

1. Habits Index: https://console.firebase.google.com/v1/r/project/routine-schemer/firestore/indexes?create_composite=Ck5wcm9qZWN0cy9yb3V0aW5lLXNjaGVtZXIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2hhYml0cy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC

2. Notes Index: https://console.firebase.google.com/v1/r/project/routine-schemer/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9yb3V0aW5lLXNjaGVtZXIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL25vdGVzL2luZGV4ZXMvXxABGgoKBnVzZXJJZRABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI

3. Calendar Events Index: https://console.firebase.google.com/v1/r/project/routine-schemer/firestore/indexes?create_composite=ClZwcm9qZWN0cy9yb3V0aW5lLXNjaGVtZXIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NhbGVuZGFyRXZlbnRzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGggKBGRhdGUQARoMCghfX25hbWVfXxAB

4. Training Programs Index: https://console.firebase.google.com/v1/r/project/routine-schemer/firestore/indexes?create_composite=Clhwcm9qZWN0cy9yb3V0aW5lLXNjaGVtZXIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3RyYWluaW5nUHJvZ3JhbXMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
