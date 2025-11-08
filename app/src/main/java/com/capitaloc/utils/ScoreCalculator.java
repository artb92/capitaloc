public class ScoreCalculator {
    private int score;

    public ScoreCalculator() {
        this.score = 0;
    }

    public void addScore(int points) {
        this.score += points;
    }

    public void subtractScore(int points) {
        this.score -= points;
    }

    public int getScore() {
        return this.score;
    }

    public void resetScore() {
        this.score = 0;
    }
}