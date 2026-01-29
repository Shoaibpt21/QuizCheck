//package selenium.automation;
//
//import org.openqa.selenium.By;
//import org.openqa.selenium.WebDriver;
//import org.openqa.selenium.WebElement;
//import org.openqa.selenium.chrome.ChromeDriver;
//
//import java.time.Duration;
//import java.util.List;
//
//public class FirstTest {
package selenium.automation;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class FirstTest {

    public static void main(String[] args) {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        driver.manage().window().maximize();

        // Create unique folder for this test run
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String runFolder = "screenshots/TestRun_" + timestamp;
        new File(runFolder).mkdirs();

        // Log file
        String logFile = runFolder + "/test_log.txt";

        try (FileWriter logWriter = new FileWriter(logFile)) {

            String url = "http://localhost/DQA/index.html";
            driver.get(url);
            System.out.println("URL: " + driver.getCurrentUrl());
            System.out.println("Title: " + driver.getTitle());
            logWriter.write("URL: " + driver.getCurrentUrl() + "\nTitle: " + driver.getTitle() + "\n\n");

            // Take screenshot of landing page
            takeScreenshot(driver, runFolder, "LandingPage");

            // Start Quiz
            WebElement startBtn = driver.findElement(By.className("start-quiz-btn"));
            startBtn.click();
            System.out.println("Clicked Start Quiz");
            logWriter.write("Clicked Start Quiz\n");

            takeScreenshot(driver, runFolder, "StartQuiz");

            // Wait for first question
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("question-text")));

            // Loop through all questions
            int questionNumber = 1;
            while (true) {
                WebElement questionText = driver.findElement(By.className("question-text"));
                System.out.println("Question " + questionNumber + ": " + questionText.getText());
                logWriter.write("Question " + questionNumber + ": " + questionText.getText() + "\n");

                // Get options
                List<WebElement> options = driver.findElements(By.cssSelector(".answer-options li"));

                // Select first option as default answer
                WebElement selectedOption = options.get(0);
                selectedOption.click();
                System.out.println("Selected answer: " + selectedOption.getText());
                logWriter.write("Selected answer: " + selectedOption.getText() + "\n");

                // Screenshot for this question
                takeScreenshot(driver, runFolder, "Question_" + questionNumber);

                // Next question or break if last
                List<WebElement> nextBtnList = driver.findElements(By.className("next-question-btn"));
                if (!nextBtnList.isEmpty()) {
                    nextBtnList.get(0).click();
                    questionNumber++;
                    // Wait for next question text to appear
                    wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("question-text")));
                } else {
                    break;
                }
            }

            // Submit Quiz
            WebElement submitBtn = driver.findElement(By.className("next-question-btn")); // assuming last button is Next/Submit
            submitBtn.click();
            System.out.println("Clicked Submit Quiz");
            logWriter.write("Clicked Submit Quiz\n");

            // Wait for result page
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("result-container")));
            System.out.println("Result page detected!");
            logWriter.write("Result page detected!\n");

            takeScreenshot(driver, runFolder, "ResultPage");

            // Read and log score
            WebElement scoreElement = driver.findElement(By.cssSelector(".result-message b"));
            System.out.println("Quiz Completed! " + scoreElement.getText());
            logWriter.write("Quiz Completed! " + scoreElement.getText() + "\n");

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            driver.quit();
        }
    }

    // Utility function to take screenshot
    public static void takeScreenshot(WebDriver driver, String folder, String name) {
        try {
            File srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            String filePath = folder + "/" + name + "_" + System.currentTimeMillis() + ".png";
            Files.copy(srcFile.toPath(), new File(filePath).toPath());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
