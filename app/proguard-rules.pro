# ProGuard rules for Capitaloc

# Keep the main activity
-keep public class com.capitaloc.activities.MainActivity {
    public <init>();
}

# Keep the game activity
-keep public class com.capitaloc.activities.GameActivity {
    public <init>();
}

# Keep the Country model
-keep public class com.capitaloc.models.Country {
    public <init>();
}

# Keep the Capital model
-keep public class com.capitaloc.models.Capital {
    public <init>();
}

# Keep the GameManager utility
-keep public class com.capitaloc.utils.GameManager {
    public <init>();
}

# Keep the ScoreCalculator utility
-keep public class com.capitaloc.utils.ScoreCalculator {
    public <init>();
}

# Keep the CountryData utility
-keep public class com.capitaloc.data.CountryData {
    public <init>();
}

# Keep all public methods in the activities
-keepclassmembers public class * {
    public *;
}

# Keep all public fields in the models
-keepclassmembers public class * {
    public <fields>;
}