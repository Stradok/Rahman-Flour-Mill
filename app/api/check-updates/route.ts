import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { auth } from "@/auth";

/**
 * Release flow (developer side):
 *   1. bump "version" in package.json
 *   2. build FlourMill-Setup-v<version>.exe (docs/BUILD_WINDOWS_INSTALLER.md)
 *   3. publish a GitHub release tagged v<version> with the .exe attached
 * The mill's Settings page then offers the download.
 */
const UPDATE_REPO = process.env.UPDATE_REPO || "Stradok/Rahman-Flour-Mill";

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  body: string;
  html_url: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get current version from package.json
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const currentVersion = packageJson.version;

    // Fetch latest release from GitHub
    const response = await fetch(
      `https://api.github.com/repos/${UPDATE_REPO}/releases/latest`,
      {
        headers: {
          "User-Agent": "FlourMill-Client",
          // Only add GitHub token if available (don't commit it)
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          }),
        },
        // Cache the response for 1 hour
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      // If GitHub API fails, just return current version
      return NextResponse.json({
        currentVersion,
        latestVersion: currentVersion,
        isUpdateAvailable: false,
        message: "Unable to check updates at this time",
      });
    }

    const release: GitHubRelease = await response.json();
    const latestVersion = release.tag_name.replace(/^v/, "");

    // Find the installer in the release assets
    const installerAsset = release.assets.find((asset) =>
      asset.name.match(/FlourMill-Setup-v\d+\.\d+\.\d+\.exe/i)
    );

    const isUpdateAvailable = compareVersions(latestVersion, currentVersion) > 0;

    return NextResponse.json({
      currentVersion,
      latestVersion,
      isUpdateAvailable,
      releaseName: release.name,
      releaseNotes: release.body,
      publishedAt: release.published_at,
      downloadUrl: installerAsset?.browser_download_url || release.html_url,
      releaseUrl: release.html_url,
    });
  } catch (error) {
    console.error("Update check error:", error);
    return NextResponse.json(
      { error: "Failed to check for updates" },
      { status: 500 }
    );
  }
}

/**
 * Compare semantic versions
 * Returns: positive if v1 > v2, negative if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  const parse = (v: string) => v.split(".").map((n) => parseInt(n, 10));
  const [major1, minor1, patch1] = parse(v1);
  const [major2, minor2, patch2] = parse(v2);

  if (major1 !== major2) return major1 - major2;
  if (minor1 !== minor2) return minor1 - minor2;
  return patch1 - patch2;
}
