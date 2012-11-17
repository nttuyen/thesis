package com.nttuyen.web.core;

import org.apache.log4j.Logger;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

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
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {}
}
