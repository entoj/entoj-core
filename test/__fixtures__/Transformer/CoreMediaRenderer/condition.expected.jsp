<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="cm" uri="http://www.coremedia.com/2004/objectserver-1.0-2.0"%>
<%@ taglib prefix="bp" uri="http://www.coremedia.com/2012/blueprint"%>
<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>
<c:if test="${ classes }"></c:if>
<c:if test="${ classes.markup() }"></c:if>
<c:if test="${ empty classes }"></c:if>
<c:if test="${ not empty classes }"></c:if>
<c:if test="${ empty model.headline or  not empty mode.copy }"></c:if>
<c:if test="${ not empty model.headline or ( not empty model.subline and model.type == 'teaser') }"></c:if>
