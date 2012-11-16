package com.nttuyen.util;

import org.apache.log4j.Logger;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Created with IntelliJ IDEA.
 * User: nttuyen
 * Date: 11/16/12
 * Time: 3:20 PM
 * To change this template use File | Settings | File Templates.
 */
public class ConfigUtil {
    private static Logger log = Logger.getLogger(ConfigUtil.class);

    public static Properties load(Properties properties, String... files) {
        if(properties == null) {
            properties = new Properties();
        }

        for(String fileName : files) {
            try {
                InputStream input = new FileInputStream(fileName);
                properties.load(input);
                input.close();
            } catch (FileNotFoundException e) {
                log.error("FileNotFoundException when loading file config", e);
            } catch (IOException e) {
                log.error("IOException when loading file config", e);
            }
        }

        return properties;
    }
}
