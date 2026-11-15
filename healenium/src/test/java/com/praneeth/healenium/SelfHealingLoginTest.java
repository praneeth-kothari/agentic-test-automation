package com.praneeth.healenium;

import com.epam.healenium.SelfHealingDriver;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.openqa.selenium.By;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Healenium self-healing showcase (two phases, ordered).
 *
 * Phase 1 (healthy): locators resolve normally. Healenium records element
 *   info in its backing store (postgres via hlm-backend) for later matching.
 * Phase 2 (broken): the same elements are addressed with deliberately wrong
 *   locators. Healenium scores the stored element info against the live DOM,
 *   substitutes the healthy locator, and the test still passes.
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SelfHealingLoginTest {

    private static final String BASE_URL = "https://www.saucedemo.com/";

    private static SelfHealingDriver driver;

    @BeforeAll
    static void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--no-sandbox",
                "--disable-dev-shm-usage", "--window-size=1280,800");
        // SelfHealingDriver wraps the real driver and intercepts findElement calls
        driver = SelfHealingDriver.create(new ChromeDriver(options));
    }

    @Test
    @Order(1)
    @DisplayName("Phase 1 - healthy locators log in and register element info")
    void healthyLogin() {
        driver.get(BASE_URL);
        driver.findElement(By.cssSelector("[data-test='username']")).sendKeys("standard_user");
        driver.findElement(By.cssSelector("[data-test='password']")).sendKeys("secret_sauce");
        driver.findElement(By.cssSelector("[data-test='login-button']")).click();
        assertTrue(driver.getCurrentUrl().contains("inventory"), "Login should reach inventory");
    }

    @Test
    @Order(2)
    @DisplayName("Phase 2 - broken locators are healed at runtime")
    void brokenLocatorsAreHealed() {
        driver.manage().deleteAllCookies(); // fresh session; stored element info persists in the backend
        driver.get(BASE_URL);

        // Deliberately broken locators - none of these exist in the DOM
        driver.findElement(By.id("user-name-wrong")).sendKeys("standard_user");
        driver.findElement(By.id("password-wrong")).sendKeys("secret_sauce");
        driver.findElement(By.id("login-button-wrong")).click();

        assertTrue(driver.getCurrentUrl().contains("inventory"),
                "Healenium should heal the broken locators and still reach inventory");
    }

    @AfterAll
    static void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
