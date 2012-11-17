/**
 * 
 */
package com.nttuyen.thesis.model;

import com.nttuyen.persistence.annotaion.Column;
import com.nttuyen.persistence.annotaion.Id;
import com.nttuyen.persistence.annotaion.Table;

/**
 * @author nttuyen
 *
 */
@Table(name="nttuyen_role")
public class Role {
	@Id(name="id")
	private long id;
	@Column(name="name")
	private String name;
	@Column(name="permission")
	private int permission;
	/**
	 * @param id the id to set
	 */
	public void setId(long id) {
		this.id = id;
	}
	/**
	 * @return the id
	 */
	public long getId() {
		return id;
	}
	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}
	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}
	/**
	 * @param permission the permission to set
	 */
	public void setPermission(int permission) {
		this.permission = permission;
	}
	/**
	 * @return the permission
	 */
	public int getPermission() {
		return permission;
	}
}
