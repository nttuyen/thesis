package com.nttuyen.web.core;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Properties;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.nttuyen.util.FileUtil;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.log4j.Logger;
import com.nttuyen.thesis.util.Auth;

/**
 * Servlet implementation class UploadServlet
 */
public class UploadServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	private static final Logger log = Logger.getLogger(UploadServlet.class);
	private Properties config = null;
       
	private String folderUpload = "";
	
    /**
     * @see HttpServlet#HttpServlet()
     */
    public UploadServlet() {
        super();
    }

	/**
	 * @see javax.servlet.Servlet#init(ServletConfig)
	 */
	@Override
    public void init(ServletConfig config) throws ServletException {
		super.init(config);
		this.config = SystemLoader.systemConfig();
		this.folderUpload = this.config.getProperty("media.upload.folder");
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doPost(request, response);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	@SuppressWarnings("unchecked")
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		PrintWriter out = response.getWriter();
		if(!Auth.hasPermission(request, Auth.EDIT_ROLE)) {
			log.error("User haven't got permission to upload file");
			out.print(config.get("media.upload.error"));
			return;
		}
		String userName = Auth.userLogged(request);
		long userId = Auth.user(request);
		if(ServletFileUpload.isMultipartContent(request)) {
			FileItemFactory factory = new DiskFileItemFactory(1024, new File(this.folderUpload));
			ServletFileUpload upload = new ServletFileUpload(factory);
			upload.setSizeMax(1024*1024*1024);
			try {
				List<FileItem> items = (List<FileItem>)upload.parseRequest(request);
				for(FileItem item : items) {
					if(!item.isFormField()) {
						String fileName = item.getName();
						log.info("Upload file: '" + fileName + "' by user '" + userName + "' - ID: " + userId);
						fileName = FileUtil.validateFileName(fileName);
						if(FileUtil.validExt(fileName, config.getProperty("media.ext"))) {
							File f = new File(this.folderUpload + File.separator + userId + "_" + fileName);
							item.write(f);
							out.print(fileName);
						} else {
							out.print(config.get("media.upload.error"));
							return;
						}
					}
				}
			} catch (FileUploadException e) {
				log.error("File upload exception", e);
			} catch (Exception e) {
				log.error("File upload exception", e);
			}
		} else {
			out.print(config.get("media.upload.error"));
			return;
		}
	}

}
