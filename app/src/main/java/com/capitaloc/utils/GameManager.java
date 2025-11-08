public class GameManager {
    private boolean isGameActive;
    private int score;

    public GameManager() {
        this.isGameActive = false;
        this.score = 0;
    }

    public void startGame() {
        isGameActive = true;
        score = 0;
        // Additional logic to initialize the game
    }

    public void endGame() {
        isGameActive = false;
        // Additional logic to handle end of game
    }

    public boolean isGameActive() {
        return isGameActive;
    }

    public int getScore() {
        return score;
    }

    public void increaseScore(int points) {
        score += points;
    }

    // Additional methods to manage game state can be added here
}