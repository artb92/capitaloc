public class GameActivity extends AppCompatActivity {

    private GameManager gameManager;
    private ScoreCalculator scoreCalculator;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);

        gameManager = new GameManager();
        scoreCalculator = new ScoreCalculator();

        // Initialize game logic here
        startGame();
    }

    private void startGame() {
        // Logic to start the game
        gameManager.startNewGame();
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Handle pause state
        gameManager.pauseGame();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Handle resume state
        gameManager.resumeGame();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Clean up resources
        gameManager.endGame();
    }
}