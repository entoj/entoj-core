<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="cm" uri="http://www.coremedia.com/2004/objectserver-1.0-2.0"%>
<%@ taglib prefix="bp" uri="http://www.coremedia.com/2012/blueprint"%>
<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>
<cm:include self="${ model.button }" view="simple"><cm:param name="model" value="${ model.button }"/></cm:include>
<cm:include self="${ self }" view="yield"><cm:param name="model" value="${ self }"/></cm:include>
<cm:include self="${ self }" view="simple"><cm:param name="classes" value="${ moduleName + '--check' }"/></cm:include>
