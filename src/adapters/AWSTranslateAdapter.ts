import type { TranslationAdapter, Translation, AWSCredentials } from "../types";
import { retryWithBackoff } from "../utils";

/**
 * AWS Translate Adapter
 * Uses AWS SDK v3 for translations
 */
export class AWSTranslateAdapter implements TranslationAdapter {
  private credentials: AWSCredentials;
  private client: any; // TranslateClient from AWS SDK

  constructor(credentials: AWSCredentials) {
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      throw new Error(
        "AWS credentials (accessKeyId and secretAccessKey) are required"
      );
    }
    this.credentials = credentials;
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      // Dynamically import AWS SDK to avoid bundling if not used
      const { TranslateClient } = await import("@aws-sdk/client-translate");

      this.client = new TranslateClient({
        region: this.credentials.region,
        credentials: {
          accessKeyId: this.credentials.accessKeyId,
          secretAccessKey: this.credentials.secretAccessKey,
        },
      });
    } catch (error) {
      throw new Error(
        "AWS SDK not installed. Run: npm install @aws-sdk/client-translate"
      );
    }
  }

  async translateBatch(
    texts: string[],
    sourceLang: string,
    targetLang: string
  ): Promise<Translation[]> {
    if (texts.length === 0) return [];

    // AWS Translate doesn't have native batch support
    // We need to make individual calls but can parallelize them
    const results = await Promise.all(
      texts.map((text) =>
        retryWithBackoff(() => this.translateText(text, sourceLang, targetLang))
      )
    );

    return results;
  }

  private async translateText(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<Translation> {
    const { TranslateTextCommand } = await import("@aws-sdk/client-translate");

    const command = new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang,
    });

    try {
      const response = await this.client.send(command);

      return {
        original: text,
        translated: response.TranslatedText || text,
        lang: targetLang,
      };
    } catch (error) {
      throw new Error(`AWS Translate error: ${(error as Error).message}`);
    }
  }
}
