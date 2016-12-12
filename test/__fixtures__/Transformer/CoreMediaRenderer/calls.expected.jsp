<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ include file="../../../../../WEB-INF/includes/taglibs.jinc" %>
<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>
<cm:include self="${ model.button }" view="simple"><cm:param name="model" value="${ model.button }"/></cm:include>
<cm:include self="${ self }" view="yield"><cm:param name="model" value="${ self }"/></cm:include>
<cm:include self="${ self }" view="simple"><cm:param name="classes" value="${ moduleName + '--check' }"/></cm:include>
