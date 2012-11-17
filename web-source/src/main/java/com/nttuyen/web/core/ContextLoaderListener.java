package com.nttuyen.web.core;

import com.nttuyen.persistence.Persistence;
import com.nttuyen.persistence.Persistences;
import com.nttuyen.persistence.jdbc.Connector;
import com.nttuyen.persistence.jdbc.ConnectorFactory;
import org.apache.log4j.Logger;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.Properties;

/**
 * Created with IntelliJ IDEA.
 * User: nttuyen
 * Date: 11/17/12
 * Time: 2:02 AM
 * To change this template use File | Settings | File Templates.
 */
public class ContextLoaderListener implements ServletContextListener {
    private Logger log = Logger.getLogger(ContextLoaderListener.class);
    private ServletContext context;
    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        this.context = servletContextEvent.getServletContext();
        log.debug("Get config folder path");
        String folder = context.getRealPath("/WEB-INF/config");
        log.debug("Folder config path: " + folder);
        SystemLoader.getInstance().setFolderConfig(folder);
        this.initDB();
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {}

    private void initDB() {
        log.debug("Execute create database");
        Properties properties = SystemLoader.systemConfig();
        Connector connector = ConnectorFactory.createConnector(properties);
        try {
            Connection connection = connector.getConnection();
            PreparedStatement stm = null;
            String[] sqls = new String[]{
                    properties.getProperty("query.create.nttuyen_user", null),
                    properties.getProperty("query.create.nttuyen_role", null),
                    properties.getProperty("query.create.nttuyen_user_role", null),
                    properties.getProperty("query.create.nttuyen_music", null),
                    properties.getProperty("query.create.nttuyen_rating", null),
                    properties.getProperty("query.create.nttuyen_rating_predict", null),
                    properties.getProperty("query.insert.init_user", null)
            };
            for(String sql : sqls){
                log.debug("Execute query: " + sql);
                if(sql != null) {
                    stm = connection.prepareStatement(sql);
                    stm.execute();
                    stm.close();
                }
            }
        } catch (Exception e){
            log.error("INITDB Exception", e);
        }
    }
}
