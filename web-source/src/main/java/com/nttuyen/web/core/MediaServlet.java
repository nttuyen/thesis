package com.nttuyen.web.core;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URLDecoder;
import java.util.Properties;
import java.util.regex.Pattern;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

/**
 * Servlet implementation class DownloadServlet
 */
public class MediaServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	private static final Logger log = Logger.getLogger(MediaServlet.class);
	
	private static final int BYTE_BUFFER = 1024;
	
	private Properties config = null;
	
	private String rootFolder = "/home/public";
	private String fileNotFoundForward = "";
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public MediaServlet() {
        super();
    }

	/**
	 * @see javax.servlet.Servlet#init(ServletConfig)
	 */
	@Override
    public void init(ServletConfig conf) throws ServletException {
		super.init(conf);
		this.config = SystemLoader.systemConfig();
		this.rootFolder = config.getProperty("media.folder");
		this.fileNotFoundForward = config.getProperty("media.file.not.found.forwad");
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String url = request.getRequestURL().toString();
		//String uri = request.getRequestURI();
		String uri = url.replaceFirst(config.getProperty("site.url"), "");
		uri = URLDecoder.decode(uri, "UTF-8");
		log.info("DOWNLOAD: " + uri);
		Pattern p = Pattern.compile("/");
		String[] elements = p.split(uri);
		String fileName = this.rootFolder;
		for(int i = 2; i < elements.length; i++) {
			fileName += File.separator + elements[i];
		}
		
		if(fileName == null || "".equals(fileName)) {
			log.error("FileName(NULL): " + fileName);
			RequestDispatcher dispatcher = getServletConfig().getServletContext().getRequestDispatcher(this.fileNotFoundForward);
			dispatcher.forward(request, response);
			return;
		}
		
		File f = new File(fileName);
		if(!f.exists() || !f.isFile()) {
			log.error("FILE NOT EXISTS: " + fileName);
			RequestDispatcher dispatcher = getServletConfig().getServletContext().getRequestDispatcher(this.fileNotFoundForward);
			dispatcher.forward(request, response);
			return;
		}
		int lenght = 0;
		ServletOutputStream op = response.getOutputStream();
		ServletContext context = getServletConfig().getServletContext();
		String mimeType = context.getMimeType(fileName);
		
		log.info("MimeTYPE: " + mimeType);
		
		response.setContentType((mimeType != null) ? mimeType : "application/octet-stream");
		response.setContentLength((int)f.length());
		
		//PROCESS DOWNLOAD
		String download = request.getParameter("download");
		log.info("DOWNLOAD = " + download);
		if("true".equalsIgnoreCase(download)) {
			response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
		}
		
		byte[] buff = new byte[BYTE_BUFFER];
		DataInputStream in = new DataInputStream(new FileInputStream(f));
		
		while((in != null) && (lenght = in.read(buff)) != -1) {
			op.write(buff, 0, lenght);
		}
		in.close();
		op.flush();
		op.close();
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
