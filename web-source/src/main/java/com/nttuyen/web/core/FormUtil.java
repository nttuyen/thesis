/**
 * 
 */
package com.nttuyen.web.core;

import java.lang.reflect.Field;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Enumeration;
import java.util.regex.Pattern;
import javax.servlet.http.HttpServletRequest;

/**
 * @author Admin
 *
 */
public class FormUtil {
	@SuppressWarnings("unchecked")
	public static void formToObject(HttpServletRequest request, Object... objs) {
		Pattern p = Pattern.compile("\\.");
		Enumeration<String> params = (Enumeration<String>)request.getParameterNames();
		for(Object obj : objs) {
			Class c = obj.getClass();
			String className = c.getName();
			System.out.println(className);
			String[] s = p.split(className);
			className = s[s.length - 1];
			Field[] fields = c.getDeclaredFields();
			for(Field f : fields) {
				String name = f.getName();
				while(params.hasMoreElements()) {
					String param = params.nextElement();
					if(name.equalsIgnoreCase(param) || (className + "." + name).equalsIgnoreCase(param)) {
						String value = request.getParameter(param);
						try {
							f.setAccessible(true);
							if(String.class.equals(f.getType())) {
								f.set(obj, value);
							} else if(Byte.class.equals(f.getType()) || f.getType().getName().equalsIgnoreCase("bype")) {
								f.setByte(obj, Byte.parseByte(value));
							} else if(Integer.class.equals(f.getType()) || f.getType().getName().equalsIgnoreCase("int")) {
								f.setInt(obj, Integer.parseInt(value));
							} else if(Short.class.equals(f.getType()) || f.getType().getName().equalsIgnoreCase("short")) {
								f.setShort(obj, Short.parseShort(value));
							} else if(Long.class.equals(f.getType()) || f.getType().getName().equalsIgnoreCase("long")) {
								try {
									f.setLong(obj, Long.parseLong(value));
								} catch (Exception e) {
									//IS Date
									DateFormat df = new SimpleDateFormat("dd/MM/yyyy");
									f.setLong(obj, df.parse(value).getTime());
								}
							} else if(Float.class.equals(f.getType()) || f.getType().getName().equalsIgnoreCase("float")) {
								f.setFloat(obj, Float.parseFloat(value));
							} else if(Double.class.equals(f.getType()) || f.getType().getName().equalsIgnoreCase("double")) {
								f.setDouble(obj, Double.parseDouble(value));
							} else if(Boolean.class.equals(f.getType()) || f.getType().getName().equalsIgnoreCase("boolean")){
								f.setBoolean(obj, Boolean.parseBoolean(value));
							} else if(Date.class.equals(f.getType())){
								DateFormat df = new SimpleDateFormat("dd/MM/yyyy");
								Date date = df.parse(value);
								f.set(obj, date);
							}
							f.setAccessible(false);
							break;
						}catch(Exception e) {
							e.printStackTrace();
						}
					}
				}
				params = (Enumeration<String>)request.getParameterNames();
			}
		}
	}
}
